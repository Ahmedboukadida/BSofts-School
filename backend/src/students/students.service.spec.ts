import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StudentsService } from './students.service';
import { NotFoundException } from '@nestjs/common';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      student: {
        findUnique: vi.fn(),
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
    service = new StudentsService(prisma);
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      const students = [
        { id: '1', firstName: 'John', lastName: 'Doe', matricule: 'STU001' },
      ];
      prisma.student.findMany.mockResolvedValue(students);
      prisma.student.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total');
      expect(result.data).toEqual(students);
    });
  });

  describe('findOne', () => {
    it('should return student by id', async () => {
      const student = { id: '1', firstName: 'John', lastName: 'Doe' };
      prisma.student.findUnique.mockResolvedValue(student);

      const result = await service.findOne('1');

      expect(result).toEqual(student);
    });

    it('should throw NotFoundException for non-existent student', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create student', async () => {
      const student = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        registrationNumber: 'STU001',
        establishmentId: '1',
      };
      prisma.student.create.mockResolvedValue(student);

      const result = await service.create({
        firstName: 'John',
        lastName: 'Doe',
        registrationNumber: 'STU001',
        establishmentId: '1',
      });

      expect(result).toEqual(student);
    });
  });

  describe('update', () => {
    it('should update student', async () => {
      const student = { id: '1', firstName: 'Updated' };
      prisma.student.findUnique.mockResolvedValue({ id: '1' });
      prisma.student.update.mockResolvedValue(student);

      const result = await service.update('1', { firstName: 'Updated' });

      expect(result).toEqual(student);
    });

    it('should throw NotFoundException for non-existent student', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { firstName: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete student for regular user', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: '1', firstName: 'John' });
      prisma.student.update.mockResolvedValue({ id: '1', isActive: false });

      const result = await service.remove('1', false, { id: 'u1', role: 'ADMIN' });

      expect(result).toHaveProperty('message');
    });

    it('should permanently delete student for root user', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: '1', firstName: 'John' });
      prisma.student.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', true, { id: 'u0', isRoot: true, role: 'ROOT' });

      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException for non-existent student', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
