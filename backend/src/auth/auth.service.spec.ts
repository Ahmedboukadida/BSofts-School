import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('$2b$10$hashed'),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      tenantSubscription: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      loginLog: {
        create: vi.fn(),
      },
    };
    jwt = {
      sign: vi.fn().mockReturnValue('mock-token'),
      signAsync: vi.fn().mockResolvedValue('mock-token'),
      verify: vi.fn(),
    };
    service = new AuthService(prisma, jwt);
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ identifier: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens for valid credentials', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: '$2b$10$hashed',
        isActive: true,
        isRoot: false,
        userRoles: [],
      };
      prisma.user.findFirst.mockResolvedValue(user);
      prisma.loginLog.create.mockResolvedValue({});
      prisma.user.update.mockResolvedValue({});

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ identifier: 'test@test.com', password: 'password' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw ForbiddenException with SUBSCRIPTION_EXPIRED when tenant subscription is expired', async () => {
      const user = {
        id: '1',
        email: 'teacher@school.com',
        password: '$2b$10$hashed',
        isActive: true,
        isRoot: false,
        tenant: { id: 'tenant-1' },
        userRoles: [],
      };
      prisma.user.findFirst.mockResolvedValue(user);
      prisma.loginLog.create.mockResolvedValue({});
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Subscription ended yesterday
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      prisma.tenantSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
        endDate: yesterday,
      });
      prisma.tenantSubscription.update.mockResolvedValue({});

      await expect(
        service.login({ identifier: 'teacher@school.com', password: 'password' }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.tenantSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: { status: 'EXPIRED' },
        }),
      );
    });

    it('should allow login and return deduplicated permissions when tenant subscription is active', async () => {
      const user = {
        id: '1',
        email: 'admin@school.com',
        password: '$2b$10$hashed',
        isActive: true,
        isRoot: false,
        tenant: { id: 'tenant-1' },
        userRoles: [
          {
            role: {
              code: 'TEACHER',
              isDeleted: false,
              permissions: [
                { permission: { code: 'STUDENTS_READ', isDeleted: false } },
                { permission: { code: 'EXAMS_WRITE', isDeleted: false } },
              ],
            },
          },
          {
            role: {
              code: 'COORDINATOR',
              isDeleted: false,
              permissions: [
                { permission: { code: 'STUDENTS_READ', isDeleted: false } }, // duplicate
                { permission: { code: 'CLASSES_READ', isDeleted: false } },
              ],
            },
          },
        ],
      };
      prisma.user.findFirst.mockResolvedValue(user);
      prisma.loginLog.create.mockResolvedValue({});
      prisma.user.update.mockResolvedValue({});
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Subscription ends in 30 days
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      prisma.tenantSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
        endDate: future,
      });

      const result = await service.login({ identifier: 'admin@school.com', password: 'password' });

      expect(result.user.roles).toEqual(['TEACHER', 'COORDINATOR']);
      expect(result.user.permissions).toEqual(['STUDENTS_READ', 'EXAMS_WRITE', 'CLASSES_READ']);
    });

    it('should allow login for Root user even without tenant subscription', async () => {
      const rootUser = {
        id: 'root-1',
        email: 'root@bsofts.com',
        password: '$2b$10$hashed',
        isActive: true,
        isRoot: true,
        tenant: null,
        userRoles: [],
      };
      prisma.user.findFirst.mockResolvedValue(rootUser);
      prisma.loginLog.create.mockResolvedValue({});
      prisma.user.update.mockResolvedValue({});
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ identifier: 'root@bsofts.com', password: 'password' });
      expect(result.user.isRoot).toBe(true);
      expect(prisma.tenantSubscription.findFirst).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: '$2b$10$hashed',
        isActive: false,
        isRoot: false,
        userRoles: [],
      };
      prisma.user.findFirst.mockResolvedValue(user);
      prisma.loginLog.create.mockResolvedValue({});

      await expect(
        service.login({ identifier: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: '$2b$10$hashed',
        isActive: true,
        isRoot: false,
        userRoles: [],
      };
      prisma.user.findFirst.mockResolvedValue(user);
      prisma.loginLog.create.mockResolvedValue({});

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ identifier: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw UnauthorizedException when public registration is disabled without invitation or admin auth', async () => {
      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ConflictException for existing email when invitation token is provided', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
          invitationToken: 'inv_validtoken',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens when invitation token is provided', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
      });
      prisma.loginLog.create.mockResolvedValue({});

      const result = await service.register({
        email: 'test@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        invitationToken: 'inv_validtoken',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
      };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('1');

      expect(result).toEqual({ ...user, tenantId: null });
    });
  });

  describe('updateProfile', () => {
    it('should update and return user profile', async () => {
      const updatedUser = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Updated',
        lastName: 'Name',
      };
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('1', { firstName: 'Updated', lastName: 'Name' });

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({ firstName: 'Updated', lastName: 'Name' }),
        }),
      );
    });
  });
});
