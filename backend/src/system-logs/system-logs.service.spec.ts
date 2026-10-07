import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemLogsService } from './system-logs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SystemLogsService', () => {
  let service: SystemLogsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      systemLog: {
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    service = new SystemLogsService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markResolved', () => {
    it('should update log with resolved status, resolvedBy and resolvedById', async () => {
      const mockResult = {
        id: 'log-1',
        level: 'ERROR',
        message: 'Test crash',
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: 'admin@bsofts.com',
        resolvedById: 'usr-123',
        createdAt: new Date(),
      };

      mockPrisma.systemLog.update.mockResolvedValue(mockResult);

      const result = await service.markResolved('log-1', 'admin@bsofts.com', 'usr-123');

      expect(mockPrisma.systemLog.update).toHaveBeenCalledWith({
        where: { id: 'log-1' },
        data: expect.objectContaining({
          resolved: true,
          resolvedBy: 'admin@bsofts.com',
          resolvedById: 'usr-123',
        }),
      });
      expect(result.resolved).toBe(true);
      expect(result.resolvedById).toBe('usr-123');
    });

    it('should support markResolved without optional resolvedById', async () => {
      const mockResult = {
        id: 'log-2',
        level: 'WARN',
        message: 'Warning event',
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: 'ROOT',
        resolvedById: null,
        createdAt: new Date(),
      };

      mockPrisma.systemLog.update.mockResolvedValue(mockResult);

      const result = await service.markResolved('log-2', 'ROOT');

      expect(mockPrisma.systemLog.update).toHaveBeenCalledWith({
        where: { id: 'log-2' },
        data: expect.objectContaining({
          resolved: true,
          resolvedBy: 'ROOT',
        }),
      });
      expect(result.resolved).toBe(true);
      expect(result.resolvedBy).toBe('ROOT');
    });
  });

  describe('findAll', () => {
    it('should query logs with pagination and filters', async () => {
      mockPrisma.systemLog.findMany.mockResolvedValue([]);
      mockPrisma.systemLog.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 10, level: 'ERROR' });

      expect(mockPrisma.systemLog.findMany).toHaveBeenCalled();
      expect(mockPrisma.systemLog.count).toHaveBeenCalled();
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });
});
