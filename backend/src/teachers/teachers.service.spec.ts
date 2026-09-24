import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TeachersService } from './teachers.service';
import { NotFoundException } from '@nestjs/common';

describe('TeachersService', () => {
  let service: TeachersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      teacher: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      matiere: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'aud-1' }),
      },
      systemLog: {
        create: vi.fn().mockResolvedValue({ id: 'sys-1' }),
      },
    };
    service = new TeachersService(prisma);
  });

  describe('findAll', () => {
    it('should return paginated teachers', async () => {
      const teachers = [
        { id: '1', firstName: 'John', lastName: 'Doe', specialization: 'Math' },
      ];
      prisma.teacher.findMany.mockResolvedValue(teachers);
      prisma.teacher.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total');
      expect(result.data).toEqual(teachers);
    });
  });

  describe('findOne', () => {
    it('should return teacher by id', async () => {
      const teacher = { id: '1', firstName: 'John', lastName: 'Doe' };
      prisma.teacher.findUnique.mockResolvedValue(teacher);

      const result = await service.findOne('1');

      expect(result).toEqual(teacher);
    });

    it('should throw NotFoundException for non-existent teacher', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create teacher', async () => {
      const teacher = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Math',
        establishmentId: '1',
      };
      prisma.teacher.create.mockResolvedValue(teacher);

      const result = await service.create({
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Math',
        establishmentId: '1',
      });

      expect(result).toEqual(teacher);
    });
  });

  describe('update', () => {
    it('should update teacher', async () => {
      const teacher = { id: '1', firstName: 'Updated' };
      prisma.teacher.findUnique.mockResolvedValue({ id: '1' });
      prisma.teacher.update.mockResolvedValue(teacher);

      const result = await service.update('1', { firstName: 'Updated' });

      expect(result).toEqual(teacher);
    });

    it('should throw NotFoundException for non-existent teacher', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { firstName: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete teacher for regular user', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: '1', firstName: 'John' });
      prisma.teacher.update.mockResolvedValue({ id: '1', isActive: false });

      const result = await service.remove('1', false, { id: 'u1', role: 'ADMIN' });

      expect(result).toHaveProperty('message');
    });

    it('should permanently delete teacher for root user', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: '1', firstName: 'John' });
      prisma.teacher.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', true, { id: 'u0', isRoot: true, role: 'ROOT' });

      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException for non-existent teacher', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
