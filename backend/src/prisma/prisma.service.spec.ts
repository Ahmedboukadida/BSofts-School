import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

describe('PrismaService', () => {
  let service: PrismaService;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((key: string) => {
        switch (key) {
          case 'DATABASE_URL':
            return 'postgresql://test:test@localhost:5432/testdb';
          case 'DATABASE_POOL_MAX':
            return '15';
          case 'DATABASE_POOL_IDLE_TIMEOUT_MS':
            return '20000';
          case 'DATABASE_POOL_CONN_TIMEOUT_MS':
            return '3000';
          default:
            return undefined;
        }
      }),
    } as unknown as ConfigService;

    service = new PrismaService(mockConfigService);
  });

  afterEach(async () => {
    try {
      await service.onModuleDestroy();
    } catch {
      // ignore
    }
  });

  it('should initialize with connection pool metrics helper', () => {
    expect(service).toBeDefined();
    expect(typeof service.getPoolMetrics).toBe('function');
    const metrics = service.getPoolMetrics();
    expect(metrics).toHaveProperty('totalCount');
    expect(metrics).toHaveProperty('idleCount');
    expect(metrics).toHaveProperty('waitingCount');
  });

  it('should use fallback defaults when config is not provided', () => {
    const defaultService = new PrismaService();
    expect(defaultService).toBeDefined();
    const metrics = defaultService.getPoolMetrics();
    expect(metrics).toBeDefined();
  });
});
