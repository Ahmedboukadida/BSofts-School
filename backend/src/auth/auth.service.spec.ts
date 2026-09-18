import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

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
      loginLog: {
        create: vi.fn(),
      },
    };
    jwt = {
      sign: vi.fn().mockReturnValue('mock-token'),
      signAsync: vi.fn().mockResolvedValue('mock-token'),
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
    it('should throw ConflictException for existing email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
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

      expect(result).toEqual(user);
    });
  });
});
