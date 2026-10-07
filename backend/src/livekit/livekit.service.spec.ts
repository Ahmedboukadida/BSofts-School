import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LivekitService } from './livekit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LivekitService', () => {
  let service: LivekitService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      platformSetting: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({}),
      },
    };
    service = new LivekitService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate simulated or signed token for participant with role grants', async () => {
      mockPrisma.platformSetting.findUnique.mockResolvedValue({
        key: 'LIVEKIT_CONFIG',
        value: JSON.stringify({
          url: 'wss://test.livekit.cloud',
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
        }),
      });

      const res = await service.generateToken({
        roomName: 'room-101',
        participantIdentity: 'user-part-1',
        participantName: 'Alice',
        isHost: true,
        canPublish: true,
        canSubscribe: true,
      });

      expect(res).toHaveProperty('token');
      expect(res.url).toBe('wss://test.livekit.cloud');
      expect(res.token).toContain('livekit');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify or safely parse webhook raw payload', async () => {
      mockPrisma.platformSetting.findUnique.mockResolvedValue({
        key: 'LIVEKIT_CONFIG',
        value: JSON.stringify({
          url: 'wss://test.livekit.cloud',
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
        }),
      });

      const payload = JSON.stringify({ event: 'participant_joined', room: 'room-101' });
      const result = await service.verifyWebhookSignature('Bearer mock-sig', payload);

      expect(result).toBeDefined();
      expect(result.event).toBe('participant_joined');
      expect(result.room).toBe('room-101');
    });
  });
});
