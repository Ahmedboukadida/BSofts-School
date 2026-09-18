import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeworkService } from './homework.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('HomeworkService', () => {
  let service: HomeworkService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      auditLog: {
        create: vi.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaService;

    service = new HomeworkService(prisma);
  });

  it('should list all non-deleted homework items by default', async () => {
    const res = await service.findAll({ page: 1, limit: 10 });
    expect(res.data.length).toBeGreaterThanOrEqual(3);
    expect(res.data.every((i) => !i.isDeleted)).toBe(true);
    expect(res.meta.total).toBe(res.data.length);
  });

  it('should find a single homework item by id', async () => {
    const item = await service.findOne('hw-1');
    expect(item).toBeDefined();
    expect(item.id).toBe('hw-1');
    expect(item.title).toContain('Série');
  });

  it('should throw NotFoundException for non-existent homework', async () => {
    await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should create a new homework item with actor snapshot', async () => {
    const user = { id: 'u-1', firstName: 'Mohamed', lastName: 'Zitouni', username: 'mzitouni', role: 'ADMIN' };
    const created = await service.create(
      {
        title: 'Devoir de Contrôle N°2',
        description: 'Fonctions exponentielles et logarithmes',
        className: '4-SC (Bac)',
        matiereName: 'Mathématiques',
      },
      user,
    );

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Devoir de Contrôle N°2');
    expect(created.createdByName).toBe('Mohamed Zitouni (@mzitouni) [ADMIN]');
    expect(created.isDeleted).toBe(false);
  });

  it('should update an existing homework item', async () => {
    const updated = await service.update('hw-2', {
      title: 'Dissertation Modifiée',
      status: 'GRADED',
    });

    expect(updated.title).toBe('Dissertation Modifiée');
    expect(updated.status).toBe('GRADED');
  });

  it('should soft delete a homework item and move it to trash', async () => {
    const res = await service.remove('hw-3', false);
    expect(res.message).toContain('trash');

    const item = await service.findOne('hw-3');
    expect(item.isDeleted).toBe(true);
    expect(item.deletedAt).toBeDefined();

    // Normal findAll should no longer return it
    const list = await service.findAll({ page: 1, limit: 10, includeDeleted: false });
    expect(list.data.some((i) => i.id === 'hw-3')).toBe(false);

    // Trash mode should return it
    const trash = await service.findAll({ page: 1, limit: 10, includeDeleted: true });
    expect(trash.data.some((i) => i.id === 'hw-3')).toBe(true);
  });

  it('should reject permanent delete if user is not ROOT', async () => {
    const user = { id: 'u-2', role: 'ADMIN', isRoot: false };
    await expect(service.remove('hw-1', true, user)).rejects.toThrow(ForbiddenException);
  });

  it('should allow permanent delete if user is ROOT', async () => {
    const rootUser = { id: 'u-root', role: 'ROOT', isRoot: true };
    const res = await service.remove('hw-1', true, rootUser);
    expect(res.message).toContain('permanently deleted');
    await expect(service.findOne('hw-1')).rejects.toThrow(NotFoundException);
  });

  it('should restore a soft-deleted homework item', async () => {
    await service.remove('hw-2', false);
    const restored = await service.restore('hw-2');
    expect(restored.isDeleted).toBe(false);
    expect(restored.deletedAt).toBeUndefined();
  });
});
