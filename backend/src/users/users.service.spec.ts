import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };
    service = new UsersService(prisma);
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [
        { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User' },
      ];
      prisma.user.findMany.mockResolvedValue(users);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total');
      expect(result.data).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = { id: '1', email: 'test@test.com', firstName: 'Test' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const user = { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User' };
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(user);

      const result = await service.create({
        email: 'test@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result).toEqual(user);
    });

    it('should throw ConflictException for existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        service.create({
          email: 'test@test.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const user = { id: '1', email: 'test@test.com', firstName: 'Updated' };
      prisma.user.findUnique.mockResolvedValue({ id: '1' });
      prisma.user.update.mockResolvedValue(user);

      const result = await service.update('1', { firstName: 'Updated' });

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { firstName: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });
      prisma.user.delete.mockResolvedValue({});

      const result = await service.remove('1');

      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
