import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClassesService } from './classes.service';
import { NotFoundException } from '@nestjs/common';

describe('ClassesService', () => {
  let service: ClassesService;
  let prisma: any;
  let cacheService: any;

  beforeEach(() => {
    cacheService = {
      buildKey: vi.fn().mockReturnValue('test-cache-key'),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
      invalidatePattern: vi.fn().mockResolvedValue(undefined),
      invalidateResource: vi.fn().mockResolvedValue(undefined),
    };

    prisma = {
      class: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'aud-1' }),
      },
      systemLog: {
        create: vi.fn().mockResolvedValue({ id: 'sys-1' }),
      },
    };
    service = new ClassesService(prisma, cacheService);
  });

  describe('findAll', () => {
    it('should return paginated classes', async () => {
      const classes = [
        { id: '1', name: 'Class A', code: 'CA01' },
      ];
      prisma.class.findMany.mockResolvedValue(classes);
      prisma.class.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total');
      expect(result.data).toEqual(classes);
    });
  });

  describe('findOne', () => {
    it('should return class by id', async () => {
      const classObj = { id: '1', name: 'Class A', code: 'CA01' };
      prisma.class.findUnique.mockResolvedValue(classObj);

      const result = await service.findOne('1');

      expect(result).toEqual(classObj);
    });

    it('should throw NotFoundException for non-existent class', async () => {
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create class', async () => {
      const classObj = {
        id: '1',
        name: 'Class A',
        code: 'CA01',
        establishmentId: '1',
        classLevelId: '1',
        academicYearId: '1',
      };
      prisma.class.findFirst.mockResolvedValue(null);
      prisma.class.create.mockResolvedValue(classObj);

      const result = await service.create({
        name: 'Class A',
        code: 'CA01',
        establishmentId: '1',
        classLevelId: '1',
        academicYearId: '1',
        periodType: 'TRIMESTER',
      });

      expect(result).toEqual(classObj);
    });
  });

  describe('update', () => {
    it('should update class', async () => {
      const classObj = { id: '1', name: 'Updated Class' };
      prisma.class.findUnique.mockResolvedValue({ id: '1' });
      prisma.class.update.mockResolvedValue(classObj);

      const result = await service.update('1', { name: 'Updated Class' });

      expect(result).toEqual(classObj);
    });

    it('should throw NotFoundException for non-existent class', async () => {
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete class for regular user', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: '1', name: 'Class 1' });
      prisma.class.update.mockResolvedValue({ id: '1', isDeleted: true });

      const result = await service.remove('1', false, { id: 'u1', role: 'ADMIN' });

      expect(result).toHaveProperty('message');
    });

    it('should permanently delete class for root user', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: '1', name: 'Class 1' });
      prisma.class.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', true, { id: 'u0', isRoot: true, role: 'ROOT' });

      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException for non-existent class', async () => {
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
