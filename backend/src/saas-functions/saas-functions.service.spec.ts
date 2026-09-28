import { describe, it, expect, beforeEach } from 'vitest';
import { SaaSFunctionsService } from './saas-functions.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('SaaSFunctionsService', () => {
  let service: SaaSFunctionsService;

  beforeEach(() => {
    service = new SaaSFunctionsService();
  });

  it('should list all active saas functions by default', async () => {
    const res = await service.findAll({});
    expect(res).toBeDefined();
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((f) => !f.isDeleted)).toBe(true);
  });

  it('should find one function by ID', async () => {
    const res = await service.findAll({});
    const first = res.data[0];
    const item = await service.findOne(first.id);
    expect(item).toBeDefined();
    expect(item.id).toBe(first.id);
  });

  it('should throw NotFoundException for non-existent ID', async () => {
    await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a new function item', async () => {
    const created = await service.create({
      name: 'Test Function',
      code: 'test_func_' + Date.now(),
      description: 'Test description',
      moduleId: 'mod-academic',
      moduleName: 'Gestion Pédagogique',
      isActive: true,
    });

    expect(created).toBeDefined();
    expect(created.name).toBe('Test Function');
    expect(created.isDeleted).toBe(false);

    const fetched = await service.findOne(created.id);
    expect(fetched.code).toBe(created.code);
  });

  it('should reject creating duplicate code', async () => {
    const code = 'dup_code_' + Date.now();
    await service.create({
      name: 'First',
      code,
      isActive: true,
    });

    await expect(
      service.create({
        name: 'Second',
        code,
        isActive: true,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should update an existing function', async () => {
    const res = await service.findAll({});
    const first = res.data[0];

    const updated = await service.update(first.id, {
      description: 'Updated description for test',
    });

    expect(updated.description).toBe('Updated description for test');
  });

  it('should soft-delete and restore a function', async () => {
    const created = await service.create({
      name: 'To Delete',
      code: 'to_delete_' + Date.now(),
      isActive: true,
    });

    // Soft delete
    const deleteRes = await service.remove(created.id, false);
    expect(deleteRes.success).toBe(true);

    // Should not appear in standard list
    const activeList = await service.findAll({ includeDeleted: false });
    expect(activeList.data.some((f) => f.id === created.id)).toBe(false);

    // Should appear in trash
    const trashList = await service.findAll({ includeDeleted: true });
    expect(trashList.data.some((f) => f.id === created.id)).toBe(true);

    // Restore
    const restored = await service.restore(created.id);
    expect(restored.isDeleted).toBe(false);

    // Permanent delete
    const permRes = await service.remove(created.id, true);
    expect(permRes.success).toBe(true);

    await expect(service.findOne(created.id)).rejects.toThrow(NotFoundException);
  });
});
