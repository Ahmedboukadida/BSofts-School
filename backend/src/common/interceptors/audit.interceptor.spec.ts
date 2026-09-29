import { describe, beforeEach, it, expect, vi } from 'vitest';
import { AuditInterceptor } from './audit.interceptor';
import { of } from 'rxjs';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-log-1' }),
      },
    };
    interceptor = new AuditInterceptor(mockPrisma);
  });

  const createMockContext = (method: string, url: string, user?: any, ip = '127.0.0.1', userAgent = 'test-agent') => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          url,
          user,
          ip,
          headers: {
            'user-agent': userAgent,
          },
        }),
      }),
    } as any;
  };

  it('should skip audit log creation for /auth/login (reserved strictly for LoginLog)', async () => {
    const context = createMockContext('POST', '/api/auth/login');
    const next = {
      handle: () => of({ accessToken: 'xyz', user: { id: 'u1' } }),
    };

    const observable = interceptor.intercept(context, next);
    await new Promise((resolve) => observable.subscribe({ next: resolve }));

    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('should create an AuditLog for successful mutations (POST /classes)', async () => {
    const user = {
      id: 'admin-1',
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      isRoot: true,
    };
    const context = createMockContext('POST', '/api/classes', user);
    const responsePayload = { id: 'cls-123', name: 'Class 6A' };
    const next = {
      handle: () => of(responsePayload),
    };

    const observable = interceptor.intercept(context, next);
    await new Promise((resolve) => observable.subscribe({ next: resolve }));

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'admin-1',
        actorSnapshot: 'Admin User (@admin) [ROOT]',
        action: 'CREATE',
        entity: 'classes',
        entityId: 'cls-123',
        status: 'SUCCESS',
        newValues: responsePayload,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      }),
    });
  });

  it('should map auth lifecycle routes to specific actions and redact sensitive payload fields', async () => {
    const context = createMockContext('POST', '/api/auth/change-password', { id: 'u2' });
    const responsePayload = {
      success: true,
      message: 'Password updated',
      password: 'plain-password-leak',
      token: 'jwt-token-leak',
    };
    const next = {
      handle: () => of(responsePayload),
    };

    const observable = interceptor.intercept(context, next);
    await new Promise((resolve) => observable.subscribe({ next: resolve }));

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'AUTH_PASSWORD_CHANGE',
        entity: 'auth',
        status: 'SUCCESS',
        newValues: expect.objectContaining({
          success: true,
          message: 'Password updated',
          password: '[REDACTED]',
          token: '[REDACTED]',
        }),
      }),
    });
  });

  it('should not create an AuditLog for GET requests', async () => {
    const context = createMockContext('GET', '/api/students');
    const next = {
      handle: () => of([{ id: 's1' }, { id: 's2' }]),
    };

    const observable = interceptor.intercept(context, next);
    await new Promise((resolve) => observable.subscribe({ next: resolve }));

    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });
});
