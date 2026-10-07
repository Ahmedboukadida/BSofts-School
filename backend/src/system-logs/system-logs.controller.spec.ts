import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemLogsController } from './system-logs.controller';
import { SystemLogsService } from './system-logs.service';

describe('SystemLogsController', () => {
  let controller: SystemLogsController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      markResolved: vi.fn(),
      clearOldLogs: vi.fn(),
      remove: vi.fn(),
    };
    controller = new SystemLogsController(mockService as unknown as SystemLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('markResolved', () => {
    it('should forward user email and id to service.markResolved', async () => {
      mockService.markResolved.mockResolvedValue({ id: 'log-1', resolved: true });
      const user = { id: 'usr-1', email: 'admin@bsofts.com', username: 'admin' };

      const res = await controller.markResolved('log-1', user);

      expect(mockService.markResolved).toHaveBeenCalledWith('log-1', 'admin@bsofts.com', 'usr-1');
      expect(res).toEqual({ id: 'log-1', resolved: true });
    });

    it('should fall back to username or ROOT if email is absent', async () => {
      mockService.markResolved.mockResolvedValue({ id: 'log-2', resolved: true });
      const user = { id: 'usr-2', username: 'superadmin' };

      await controller.markResolved('log-2', user);

      expect(mockService.markResolved).toHaveBeenCalledWith('log-2', 'superadmin', 'usr-2');
    });
  });
});
