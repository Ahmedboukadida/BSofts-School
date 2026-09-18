import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(),
}));

describe('MailService', () => {
  let service: MailService;
  let prisma: any;
  let sendMailMock: any;

  beforeEach(() => {
    sendMailMock = vi.fn().mockResolvedValue({ messageId: 'msg-123' });
    (nodemailer.createTransport as any).mockReturnValue({
      sendMail: sendMailMock,
    });

    prisma = {
      smtpConfig: {
        findFirst: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'aud-1' }),
      },
      systemLog: {
        create: vi.fn().mockResolvedValue({ id: 'sys-1' }),
      },
    };
    service = new MailService(prisma);
  });

  describe('sendMail', () => {
    it('should dispatch email and return success result with messageId', async () => {
      const result = await service.sendMail(
        {
          to: 'student@bsofts.com',
          subject: 'Test Welcome',
          text: 'Welcome to BSofts School',
        },
        'est-1',
        { id: 'u1', firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-123');
      expect(sendMailMock).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should handle transport error gracefully and log to systemLog', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('SMTP Connection Refused'));

      const result = await service.sendMail(
        {
          to: 'invalid@bsofts.com',
          subject: 'Fail Test',
        },
        'est-1',
        { id: 'u1' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('SMTP Connection Refused');
      expect(prisma.systemLog.create).toHaveBeenCalled();
    });
  });

  describe('getConfig', () => {
    it('should return active configuration if exists', async () => {
      const config = {
        id: 'smtp-1',
        establishmentId: 'est-1',
        host: 'smtp.office365.com',
        port: 587,
        user: 'school@bsofts.com',
        fromName: 'BSofts',
        fromEmail: 'school@bsofts.com',
        isSecure: true,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.smtpConfig.findFirst.mockResolvedValue(config);

      const result = await service.getConfig('est-1');
      expect(result).toBeDefined();
      expect(result?.host).toBe('smtp.office365.com');
    });

    it('should return null if no config found', async () => {
      prisma.smtpConfig.findFirst.mockResolvedValue(null);
      const result = await service.getConfig('est-none');
      expect(result).toBeNull();
    });
  });

  describe('saveConfig', () => {
    it('should deactivate existing defaults and create new smtp config', async () => {
      const newConfig = {
        id: 'smtp-2',
        establishmentId: 'est-1',
        host: 'smtp.mailgun.org',
        port: 587,
        user: 'mg@bsofts.com',
        fromName: 'BSofts Mailgun',
        fromEmail: 'mg@bsofts.com',
        isSecure: true,
        isDefault: true,
      };
      prisma.smtpConfig.create.mockResolvedValue(newConfig);

      const result = await service.saveConfig(
        'est-1',
        {
          host: 'smtp.mailgun.org',
          port: 587,
          user: 'mg@bsofts.com',
          password: 'secretPassword123',
          fromName: 'BSofts Mailgun',
          fromEmail: 'mg@bsofts.com',
          isDefault: true,
        },
        { id: 'u1', role: 'ADMIN' },
      );

      expect(prisma.smtpConfig.updateMany).toHaveBeenCalledWith({
        where: { establishmentId: 'est-1' },
        data: { isDefault: false },
      });
      expect(result.host).toBe('smtp.mailgun.org');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
