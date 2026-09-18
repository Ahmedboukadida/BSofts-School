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
});
