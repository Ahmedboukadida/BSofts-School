import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtService: JwtService;
  let mockServer: any;

  beforeEach(() => {
    jwtService = {
      verify: vi.fn(),
    } as unknown as JwtService;

    gateway = new NotificationsGateway(jwtService);

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    gateway.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should disconnect client if no token provided', async () => {
      const mockClient: any = {
        id: 'client-1',
        handshake: { auth: {}, headers: {} },
        disconnect: vi.fn(),
        join: vi.fn(),
        data: {},
      };

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('should authenticate client with auth.token and join user & tenant rooms', async () => {
      const mockClient: any = {
        id: 'client-2',
        handshake: {
          auth: { token: 'valid-token' },
          headers: {},
        },
        disconnect: vi.fn(),
        join: vi.fn(),
        data: {},
      };

      vi.spyOn(jwtService, 'verify').mockReturnValue({
        sub: 'user-123',
        tenantId: 'tenant-456',
        role: 'ADMIN',
      });

      await gateway.handleConnection(mockClient);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockClient.data.user).toEqual({
        sub: 'user-123',
        tenantId: 'tenant-456',
        role: 'ADMIN',
      });
      expect(mockClient.join).toHaveBeenCalledWith('user:user-123');
      expect(mockClient.join).toHaveBeenCalledWith('tenant:tenant-456');
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should authenticate client from authorization header and join user room without tenant', async () => {
      const mockClient: any = {
        id: 'client-3',
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
        disconnect: vi.fn(),
        join: vi.fn(),
        data: {},
      };

      vi.spyOn(jwtService, 'verify').mockReturnValue({
        id: 'user-789',
        role: 'ROOT',
      });

      await gateway.handleConnection(mockClient);

      expect(jwtService.verify).toHaveBeenCalledWith('header-token');
      expect(mockClient.join).toHaveBeenCalledWith('user:user-789');
      expect(mockClient.join).toHaveBeenCalledTimes(1);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client if JWT verification throws error', async () => {
      const mockClient: any = {
        id: 'client-4',
        handshake: {
          auth: { token: 'invalid-token' },
          headers: {},
        },
        disconnect: vi.fn(),
        join: vi.fn(),
        data: {},
      };

      vi.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('JsonWebTokenError: invalid signature');
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnection cleanly', () => {
      const mockClient: any = { id: 'client-disc' };
      expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
    });
  });

  describe('handleJoinTenant', () => {
    it('should allow joining tenant room if tenantId matches user profile', () => {
      const mockClient: any = {
        data: { user: { tenantId: 'tenant-100' } },
        join: vi.fn(),
      };

      gateway.handleJoinTenant(mockClient, 'tenant-100');

      expect(mockClient.join).toHaveBeenCalledWith('tenant:tenant-100');
    });

    it('should allow root administrator to join any tenant room', () => {
      const mockClient: any = {
        data: { user: { tenantId: 'root-tenant', isRoot: true } },
        join: vi.fn(),
      };

      gateway.handleJoinTenant(mockClient, 'any-tenant-target');

      expect(mockClient.join).toHaveBeenCalledWith('tenant:any-tenant-target');
    });

    it('should reject joining tenant room if tenantId does not match user and not root', () => {
      const mockClient: any = {
        data: { user: { tenantId: 'tenant-abc', isRoot: false } },
        join: vi.fn(),
      };

      gateway.handleJoinTenant(mockClient, 'tenant-unauthorized');

      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('emitToUser and emitToTenant', () => {
    it('should emit event to isolated user room', () => {
      gateway.emitToUser('user-55', 'notification:new', { text: 'Welcome' });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-55');
      expect(mockServer.emit).toHaveBeenCalledWith('notification:new', { text: 'Welcome' });
    });

    it('should emit broadcast event to isolated tenant room', () => {
      gateway.emitToTenant('tenant-99', 'broadcast:alert', { alert: 'Maintenance' });

      expect(mockServer.to).toHaveBeenCalledWith('tenant:tenant-99');
      expect(mockServer.emit).toHaveBeenCalledWith('broadcast:alert', { alert: 'Maintenance' });
    });
  });
});
