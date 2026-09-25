import { describe, beforeEach, it, expect } from 'vitest';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  describe('root', () => {
    it('should return status', () => {
      const result = appController.getStatus();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status', 'running');
    });
  });

  describe('health probes', () => {
    it('should return overall health payload', async () => {
      const result = await appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('checks');
    });

    it('should return liveness status', () => {
      const result = appController.getLiveness();
      expect(result).toHaveProperty('status', 'UP');
      expect(result).toHaveProperty('uptime');
    });

    it('should return readiness status', async () => {
      const result = await appController.getReadiness();
      expect(result).toHaveProperty('ready', true);
      expect(result).toHaveProperty('status', 'READY');
    });

    it('should return redis probe fallback', async () => {
      const result = await appController.getRedisHealth();
      expect(result).toHaveProperty('status', 'UP');
      expect(result).toHaveProperty('driver', 'memory');
    });
  });
});
