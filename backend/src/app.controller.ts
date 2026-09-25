import { Controller, Get, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators';
import { PrismaService } from './prisma/prisma.service';
import { CacheService } from './common/cache/cache.service';

@ApiTags('Health & System')
@Controller()
export class AppController {
  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly cache?: CacheService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'API root descriptor' })
  getStatus() {
    return {
      name: 'BSofts School API',
      version: '0.0.1',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Comprehensive system health probe' })
  async getHealth() {
    let dbStatus: { status: 'UP' | 'DOWN'; latencyMs?: number; error?: string } = { status: 'UP' };
    if (this.prisma) {
      const start = Date.now();
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        dbStatus = { status: 'UP', latencyMs: Date.now() - start };
      } catch (err: any) {
        dbStatus = { status: 'DOWN', latencyMs: Date.now() - start, error: err?.message };
      }
    }

    const cacheStatus = this.cache
      ? await this.cache.checkHealth()
      : { status: 'UP' as const, driver: 'memory' as const, memoryEntries: 0 };
    const isHealthy = dbStatus.status === 'UP' && cacheStatus.status === 'UP';

    const memoryUsage = process.memoryUsage();

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      },
      checks: {
        database: dbStatus,
        cache: cacheStatus,
      },
    };
  }

  @Public()
  @Get('health/db')
  @ApiOperation({ summary: 'Database connectivity probe' })
  async getDbHealth() {
    if (!this.prisma) {
      return { status: 'UNKNOWN', message: 'PrismaService not injected' };
    }
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'UP',
        component: 'PostgreSQL',
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: 'DOWN',
        component: 'PostgreSQL',
        latencyMs: Date.now() - start,
        error: err?.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Get('health/redis')
  @ApiOperation({ summary: 'Redis and Cache connectivity probe' })
  async getRedisHealth() {
    if (!this.cache) {
      return { status: 'UP', driver: 'memory', message: 'In-memory cache fallback active' };
    }
    const status = await this.cache.checkHealth();
    return {
      ...status,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health/liveness')
  @ApiOperation({ summary: 'Kubernetes/Docker liveness probe' })
  getLiveness() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health/readiness')
  @ApiOperation({ summary: 'Kubernetes/Docker readiness probe' })
  async getReadiness() {
    let dbReady = true;
    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
      } catch {
        dbReady = false;
      }
    }
    return {
      status: dbReady ? 'READY' : 'NOT_READY',
      ready: dbReady,
      timestamp: new Date().toISOString(),
    };
  }
}
