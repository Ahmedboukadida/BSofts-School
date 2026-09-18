import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RolesService } from './roles.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      role: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };
    service = new RolesService(prisma);
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      const roles = [
        { id: '1', name: 'ADMIN', description: 'Administrator' },
      ];
      prisma.role.findMany.mockResolvedValue(roles);
      prisma.role.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total');
      expect(result.data).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      const role = { id: '1', name: 'ADMIN', description: 'Administrator' };
      prisma.role.findUnique.mockResolvedValue(role);

      const result = await service.findOne('1');

      expect(result).toEqual(role);
    });

    it('should throw NotFoundException for non-existent role', async () => {
      prisma.role.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create role', async () => {
      const role = { id: '1', name: 'ADMIN', code: 'ADMIN', description: 'Administrator' };
      prisma.role.findFirst.mockResolvedValue(null);
      prisma.role.create.mockResolvedValue(role);

      const result = await service.create({
        name: 'ADMIN',
        code: 'ADMIN',
        description: 'Administrator',
      });

      expect(result).toEqual(role);
    });

    it('should throw ConflictException for existing name', async () => {
      prisma.role.findFirst.mockResolvedValue({ id: '1' });

      await expect(
        service.create({ name: 'ADMIN', code: 'ADMIN', description: 'Administrator' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update role', async () => {
      const role = { id: '1', name: 'ADMIN', description: 'Updated' };
      prisma.role.findUnique.mockResolvedValue({ id: '1' });
      prisma.role.update.mockResolvedValue(role);

      const result = await service.update('1', { description: 'Updated' });

      expect(result).toEqual(role);
    });

    it('should throw NotFoundException for non-existent role', async () => {
      prisma.role.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { description: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove role', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: '1', _count: { userRoles: 0 } });
      prisma.role.delete.mockResolvedValue({});

      const result = await service.remove('1');

      expect(result).toHaveProperty('message');
    });
  });
});
