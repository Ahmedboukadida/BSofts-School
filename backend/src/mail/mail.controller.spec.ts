import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { BadRequestException } from '@nestjs/common';
import { MailSendResultEntity, SmtpConfigEntity } from './mail.entity';

describe('MailController', () => {
  let controller: MailController;
  let service: any;

  beforeEach(() => {
    service = {
      sendMail: vi.fn(),
      getConfig: vi.fn(),
      saveConfig: vi.fn(),
    };
    controller = new MailController(service as MailService);
  });

  it('should send email using user establishment context', async () => {
    service.sendMail.mockResolvedValue(new MailSendResultEntity({ success: true, messageId: 'm-1' }));

    const req = { user: { id: 'u1', establishmentId: 'est-1', role: 'ADMIN' } };
    const result = await controller.sendEmail(
      { to: 'test@example.com', subject: 'Hello' },
      req,
    );

    expect(result.success).toBe(true);
    expect(service.sendMail).toHaveBeenCalledWith(
      { to: 'test@example.com', subject: 'Hello' },
      'est-1',
      req.user,
    );
  });

  it('should trigger test smtp dispatch', async () => {
    service.sendMail.mockResolvedValue(new MailSendResultEntity({ success: true, messageId: 'm-test' }));

    const req = { user: { id: 'u1', establishmentId: 'est-1', role: 'ADMIN' } };
    const result = await controller.testSmtp({ testEmail: 'probe@test.com' }, req);

    expect(result.success).toBe(true);
    expect(service.sendMail).toHaveBeenCalled();
  });

  it('should get configuration for active establishment', async () => {
    service.getConfig.mockResolvedValue(new SmtpConfigEntity({ host: 'smtp.test.com' }));

    const req = { user: { establishmentId: 'est-1' } };
    const result = await controller.getConfig(req);

    expect(result?.host).toBe('smtp.test.com');
  });

  it('should throw BadRequestException if no establishment context on getConfig', async () => {
    const req = { user: {} };
    await expect(controller.getConfig(req)).rejects.toThrow(BadRequestException);
  });
});
