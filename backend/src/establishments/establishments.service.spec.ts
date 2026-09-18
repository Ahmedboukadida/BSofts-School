import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EstablishmentsService } from './establishments.service';
import { NotFoundException } from '@nestjs/common';

describe('EstablishmentsService', () => {
  let service: EstablishmentsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      establishment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      tenant: {
        findUnique: vi.fn(),
      },
    };
    service = new EstablishmentsService(prisma);
  });

  describe('findAll', () => {
    it('should return paginated establishments', async () => {
      const establishments = [
        { id: '1', name: 'School A', slug: 'school-a', category: 'SCHOOL' },
      ];
      prisma.establishment.findMany.mockResolvedValue(establishments);
      prisma.establishment.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total');
      expect(result.data).toEqual(establishments);
    });
  });

  describe('findOne', () => {
    it('should return establishment by id', async () => {
      const establishment = { id: '1', name: 'School A', slug: 'school-a' };
      prisma.establishment.findUnique.mockResolvedValue(establishment);

      const result = await service.findOne('1');

      expect(result).toEqual(establishment);
    });

    it('should throw NotFoundException for non-existent establishment', async () => {
      prisma.establishment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create establishment', async () => {
      const establishment = {
        id: '1',
        name: 'School A',
        slug: 'school-a',
        category: 'SCHOOL',
        tenantId: '1',
      };
      prisma.tenant.findUnique.mockResolvedValue({ id: '1' });
      prisma.establishment.create.mockResolvedValue(establishment);

      const result = await service.create({
        name: 'School A',
        slug: 'school-a',
        category: 'SCHOOL',
        tenantId: '1',
      });

      expect(result).toEqual(establishment);
    });

    it('should throw NotFoundException for non-existent tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'School A',
          slug: 'school-a',
          category: 'SCHOOL',
          tenantId: 'non-existent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update establishment', async () => {
      const establishment = { id: '1', name: 'Updated School' };
      prisma.establishment.findUnique.mockResolvedValue({ id: '1' });
      prisma.establishment.update.mockResolvedValue(establishment);

      const result = await service.update('1', { name: 'Updated School' });

      expect(result).toEqual(establishment);
    });

    it('should throw NotFoundException for non-existent establishment', async () => {
      prisma.establishment.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove establishment', async () => {
      prisma.establishment.findUnique.mockResolvedValue({ id: '1' });
      prisma.establishment.delete.mockResolvedValue({});

      const result = await service.remove('1');

      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException for non-existent establishment', async () => {
      prisma.establishment.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
