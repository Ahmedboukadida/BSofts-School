import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './ai.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AiService', () => {
  let service: AiService;
  let prismaMock: any;
  let cryptoMock: any;
  let platformSettingsMock: any;

  beforeEach(() => {
    prismaMock = {
      tenantPlanFeatureOverride: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      tenantSubscription: {
        findFirst: vi.fn(),
      },
      tenant: {
        findUnique: vi.fn(),
      },
      establishment: {
        findMany: vi.fn(),
      },
      class: {
        count: vi.fn(),
        findFirst: vi.fn(),
      },
      student: {
        count: vi.fn(),
        findUnique: vi.fn(),
      },
      teacher: {
        count: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    };

    cryptoMock = {
      encrypt: vi.fn((val) => `ENC:${val}`),
      decrypt: vi.fn((val) => (val?.startsWith('ENC:') ? val.replace('ENC:', '') : val)),
    };

    platformSettingsMock = {
      getAllAsMap: vi.fn().mockResolvedValue({
        AI_DEFAULT_PROVIDER: 'GEMINI',
        AI_DEFAULT_MODEL: 'gemini-2.5-flash',
        AI_GEMINI_API_KEY: 'ENC:test-gemini-key',
      }),
      upsert: vi.fn().mockResolvedValue({}),
    };

    service = new AiService(prismaMock, cryptoMock, platformSettingsMock);
  });

  describe('isTenantAiEnabled', () => {
    it('returns true when user is ROOT', async () => {
      const result = await service.isTenantAiEnabled('tenant-1', true);
      expect(result).toBe(true);
    });

    it('returns false when tenantId is null and not root', async () => {
      const result = await service.isTenantAiEnabled(null, false);
      expect(result).toBe(false);
    });

    it('returns true when tenantPlanFeatureOverride value is "true"', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue({
        tenantId: 'tenant-1',
        featureCode: 'AI_FEATURES_ENABLED',
        value: 'true',
      });

      const result = await service.isTenantAiEnabled('tenant-1', false);
      expect(result).toBe(true);
      expect(prismaMock.tenantPlanFeatureOverride.findUnique).toHaveBeenCalled();
    });

    it('returns false when tenantPlanFeatureOverride value is "false"', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue({
        tenantId: 'tenant-1',
        featureCode: 'AI_FEATURES_ENABLED',
        value: 'false',
      });

      const result = await service.isTenantAiEnabled('tenant-1', false);
      expect(result).toBe(false);
    });

    it('falls back to active subscription plan feature when override does not exist', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue(null);
      prismaMock.tenantSubscription.findFirst.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [
            { code: 'AI_FEATURES_ENABLED', value: 'true' },
          ],
        },
      });

      const result = await service.isTenantAiEnabled('tenant-1', false);
      expect(result).toBe(true);
    });
  });

  describe('getStatusForUser', () => {
    it('returns isEnabled true and provider/model for permitted user', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue({
        value: 'true',
      });

      const status = await service.getStatusForUser({
        tenantId: 'tenant-123',
        isRoot: false,
      });

      expect(status).toEqual({
        isEnabled: true,
        provider: 'GEMINI',
        model: 'gemini-2.5-flash',
      });
    });

    it('returns isEnabled false when tenant has not enabled AI', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue(null);
      prismaMock.tenantSubscription.findFirst.mockResolvedValue(null);

      const status = await service.getStatusForUser({
        tenantId: 'tenant-disabled',
        isRoot: false,
      });

      expect(status.isEnabled).toBe(false);
    });
  });

  describe('tenant-gate enforcement on AI actions', () => {
    it('throws ForbiddenException on chat when AI is disabled for tenant', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue({
        value: 'false',
      });

      await expect(
        service.chat({ tenantId: 'tenant-1', isRoot: false }, { message: 'hello' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException on generateExam when AI is disabled for tenant', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue(null);
      prismaMock.tenantSubscription.findFirst.mockResolvedValue(null);

      await expect(
        service.generateExam(
          { tenantId: 'tenant-1', isRoot: false },
          { topic: 'Math functions' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException on generateBulletinRemarks when student is from different tenant', async () => {
      prismaMock.tenantPlanFeatureOverride.findUnique.mockResolvedValue({
        value: 'true',
      });
      prismaMock.student.findUnique.mockResolvedValue({
        id: 'student-99',
        firstName: 'Jean',
        lastName: 'Dupont',
        establishment: { tenantId: 'other-tenant' },
      });

      await expect(
        service.generateBulletinRemarks(
          { tenantId: 'my-tenant', isRoot: false },
          { studentId: 'student-99' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleTenantAi', () => {
    it('throws NotFoundException if tenant does not exist', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue(null);

      await expect(service.toggleTenantAi('nonexistent', true)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('upserts tenantPlanFeatureOverride and creates audit log when valid', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        user: { email: 'admin@school.com' },
      });
      prismaMock.tenantPlanFeatureOverride.upsert.mockResolvedValue({
        id: 'override-1',
        tenantId: 'tenant-1',
        featureCode: 'AI_FEATURES_ENABLED',
        value: 'true',
      });

      const res = await service.toggleTenantAi('tenant-1', true, {
        id: 'root-id',
        email: 'root@bsofts.com',
        role: 'ROOT',
      });

      expect(res.isEnabled).toBe(true);
      expect(prismaMock.tenantPlanFeatureOverride.upsert).toHaveBeenCalledWith({
        where: {
          tenantId_featureCode: {
            tenantId: 'tenant-1',
            featureCode: 'AI_FEATURES_ENABLED',
          },
        },
        update: { value: 'true' },
        create: {
          tenantId: 'tenant-1',
          featureCode: 'AI_FEATURES_ENABLED',
          value: 'true',
        },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });
});
