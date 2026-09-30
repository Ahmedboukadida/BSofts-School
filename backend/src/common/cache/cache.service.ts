import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private isRedisConnected = false;
  private memoryCache = new Map<string, CacheEntry>();
  private memoryRateLimit = new Map<string, { count: number; resetAt: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    if (redisUrl || redisHost) {
      try {
        this.redisClient = redisUrl
          ? new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 })
          : new Redis({ host: redisHost, port: redisPort, lazyConnect: true, maxRetriesPerRequest: 1 });

        this.redisClient.on('connect', () => {
          this.isRedisConnected = true;
          this.logger.log('Connected successfully to Redis');
        });

        this.redisClient.on('error', (err) => {
          this.isRedisConnected = false;
          this.logger.warn(`Redis connection error, falling back to in-memory cache: ${err.message}`);
        });

        await this.redisClient.connect();
        this.isRedisConnected = true;
        this.logger.log('Redis Cache initialized');
      } catch (error: any) {
        this.isRedisConnected = false;
        this.logger.warn(`Failed to connect to Redis (${error?.message}). Utilizing in-memory cache fallback.`);
      }
    } else {
      this.logger.log('No REDIS_URL configured; using in-memory high-speed cache');
    }

    // Periodic sweep for expired in-memory items every 30 seconds
    this.cleanupInterval = setInterval(() => this.pruneExpiredMemoryEntries(), 30000);
    this.cleanupInterval.unref();
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryCache.clear();
    this.memoryRateLimit.clear();

    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch {
        // ignore on shutdown
      }
    }
  }

  /**
   * Builds standardized tenant-partitioned cache key
   */
  buildKey(tenantId?: string | null, establishmentId?: string | null, resource?: string, suffix?: any): string {
    const t = tenantId || 'tenant_all';
    const e = establishmentId || 'est_all';
    const r = resource || 'res';
    const s = typeof suffix === 'object' ? JSON.stringify(suffix) : String(suffix || 'default');
    return `bsofts:${t}:${e}:${r}:${s}`;
  }

  /**
   * Retrieve cached item
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        if (data) {
          return JSON.parse(data) as T;
        }
        return null;
      } catch (err: any) {
        this.logger.warn(`Redis GET error for key ${key}: ${err.message}`);
      }
    }

    // Fallback: in-memory cache
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value as T;
  }

  /**
   * Set cached item with TTL in seconds (default 60s)
   */
  async set(key: string, value: any, ttlSeconds = 60): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const serialized = JSON.stringify(value);
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        return;
      } catch (err: any) {
        this.logger.warn(`Redis SET error for key ${key}: ${err.message}`);
      }
    }

    // Fallback: in-memory cache
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete single key
   */
  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err: any) {
        this.logger.warn(`Redis DEL error for key ${key}: ${err.message}`);
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate all keys matching pattern or resource prefix
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // 1. In-memory pattern deletion
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regexPattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // 2. Redis SCAN & DEL
    if (this.isRedisConnected && this.redisClient) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.redisClient.del(...keys);
          }
        } while (cursor !== '0');
      } catch (err: any) {
        this.logger.warn(`Redis SCAN/DEL pattern error (${pattern}): ${err.message}`);
      }
    }
  }

  /**
   * Invalidate all cache entries for a specific resource within an establishment/tenant
   */
  async invalidateResource(tenantId?: string | null, establishmentId?: string | null, resource?: string): Promise<void> {
    const t = tenantId || '*';
    const e = establishmentId || '*';
    const r = resource || '*';
    const pattern = `bsofts:${t}:${e}:${r}:*`;
    await this.invalidatePattern(pattern);
  }

  /**
   * Health status check for cache layer
   */
  async checkHealth(): Promise<{ status: 'UP' | 'DOWN'; driver: 'redis' | 'memory'; latencyMs?: number; memoryEntries: number }> {
    const memoryEntries = this.memoryCache.size;
    if (this.isRedisConnected && this.redisClient) {
      const start = Date.now();
      try {
        await this.redisClient.ping();
        return {
          status: 'UP',
          driver: 'redis',
          latencyMs: Date.now() - start,
          memoryEntries,
        };
      } catch {
        return {
          status: 'DOWN',
          driver: 'redis',
          latencyMs: Date.now() - start,
          memoryEntries,
        };
      }
    }
    return {
      status: 'UP',
      driver: 'memory',
      memoryEntries,
    };
  }

  /**
   * Atomic rate limit increment with automatic expiration.
   * Leverages Redis MULTI INCR + TTL when available; falls back to high-speed in-memory rate limiting.
   */
  async incrementRateLimit(key: string, windowSeconds: number): Promise<{ count: number; ttl: number }> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const results = await this.redisClient
          .multi()
          .incr(key)
          .ttl(key)
          .exec();

        if (results && results[0] && results[1]) {
          const count = Number(results[0][1] || 1);
          let ttl = Number(results[1][1] || -1);

          // If the key is newly created (TTL == -1), set the expiration
          if (ttl === -1) {
            await this.redisClient.expire(key, windowSeconds);
            ttl = windowSeconds;
          }

          return { count, ttl: Math.max(1, ttl) };
        }
      } catch (err: any) {
        this.logger.warn(`Redis rate limit error for key ${key}: ${err.message}`);
      }
    }

    // In-memory fallback
    const now = Date.now();
    let entry = this.memoryRateLimit.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowSeconds * 1000 };
      this.memoryRateLimit.set(key, entry);
      return { count: 1, ttl: windowSeconds };
    } else {
      entry.count += 1;
      const ttl = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      return { count: entry.count, ttl };
    }
  }

  private pruneExpiredMemoryEntries() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
    for (const [key, entry] of this.memoryRateLimit.entries()) {
      if (now > entry.resetAt) {
        this.memoryRateLimit.delete(key);
      }
    }
  }
}

