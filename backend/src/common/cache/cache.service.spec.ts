import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';

describe('CacheService', () => {
  let service: CacheService;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'REDIS_URL') return undefined; // Test in-memory mode by default
        return undefined;
      }),
    };
    service = new CacheService(mockConfigService);
    service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('In-Memory Caching', () => {
    it('should set and get values with TTL', async () => {
      await service.set('test-key', { foo: 'bar' }, 60);
      const val = await service.get<{ foo: string }>('test-key');
      expect(val).toEqual({ foo: 'bar' });
    });

    it('should return null for expired items', async () => {
      // Set with 0 or negative TTL
      await service.set('expired-key', 'data', -1);
      const val = await service.get('expired-key');
      expect(val).toBeNull();
    });

    it('should delete keys correctly', async () => {
      await service.set('delete-key', 123, 60);
      await service.del('delete-key');
      const val = await service.get('delete-key');
      expect(val).toBeNull();
    });

    it('should invalidate entries matching pattern', async () => {
      await service.set('bsofts:tenant1:users:1', 'v1', 60);
      await service.set('bsofts:tenant1:users:2', 'v2', 60);
      await service.set('bsofts:tenant2:classes:1', 'v3', 60);
      await service.invalidatePattern('bsofts:tenant1:*');
      expect(await service.get('bsofts:tenant1:users:1')).toBeNull();
      expect(await service.get('bsofts:tenant1:users:2')).toBeNull();
      expect(await service.get('bsofts:tenant2:classes:1')).toEqual('v3');
    });
  });

  describe('Rate Limiting (In-Memory Fallback)', () => {
    it('should increment counts and retain window TTL', async () => {
      const res1 = await service.incrementRateLimit('rate_limit:user:1', 10);
      expect(res1.count).toBe(1);
      expect(res1.ttl).toBeGreaterThanOrEqual(9);

      const res2 = await service.incrementRateLimit('rate_limit:user:1', 10);
      expect(res2.count).toBe(2);
      expect(res2.ttl).toBeGreaterThanOrEqual(8);
    });

    it('should reset window after expiration', async () => {
      const key = 'rate_limit:user:fast-expire';
      // Mock Date.now to test window expiration
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const res1 = await service.incrementRateLimit(key, 5);
      expect(res1.count).toBe(1);

      // Fast-forward past resetAt (5 seconds = 5000ms)
      vi.spyOn(Date, 'now').mockReturnValue(now + 6000);

      const res2 = await service.incrementRateLimit(key, 5);
      expect(res2.count).toBe(1); // Window reset!

      vi.restoreAllMocks();
    });
  });

  describe('Lifecycle and Teardown (B4)', () => {
    it('should clear intervals and in-memory stores without error on onModuleDestroy', async () => {
      await service.set('some-key', 'data', 60);
      await service.incrementRateLimit('some-rl-key', 60);

      await expect(service.onModuleDestroy()).resolves.not.toThrow();

      // After destroy, maps should be empty
      expect(await service.get('some-key')).toBeNull();
    });
  });
});
