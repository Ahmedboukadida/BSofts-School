import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendEmailDto, CreateSmtpConfigDto } from './mail.dto';
import { SmtpConfigEntity, MailSendResultEntity } from './mail.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTransporter(establishmentId?: string): Promise<nodemailer.Transporter> {
    let host = process.env.SMTP_HOST || 'smtp.gmail.com';
    let port = parseInt(process.env.SMTP_PORT || '587', 10);
    let secure = process.env.SMTP_SECURE === 'true';
    let user = process.env.SMTP_USER || '';
    let pass = process.env.SMTP_PASSWORD || '';

    if (establishmentId) {
      const config = await this.prisma.smtpConfig.findFirst({
        where: { establishmentId, isDefault: true },
      });
      if (config) {
        host = config.host;
        port = config.port;
        secure = config.isSecure;
        user = config.user;
        pass = config.password;
      }
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
  }

  async sendMail(dto: SendEmailDto, establishmentId?: string, actor?: any): Promise<MailSendResultEntity> {
    try {
      const transporter = await this.getTransporter(establishmentId);

      let fromHeader = process.env.SMTP_FROM || 'BSofts School <no-reply@bsofts-school.com>';
      if (establishmentId) {
        const config = await this.prisma.smtpConfig.findFirst({
          where: { establishmentId, isDefault: true },
        });
        if (config) {
          fromHeader = `"${config.fromName}" <${config.fromEmail}>`;
        }
      }

      const info = await transporter.sendMail({
        from: fromHeader,
        to: dto.to,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
      });

      // Write Audit Log on success
      if (actor?.id) {
        await this.prisma.auditLog.create({
          data: {
            userId: actor.id,
            actorSnapshot: `${actor.firstName || ''} ${actor.lastName || ''} (@${actor.email || actor.username || 'unknown'}) [${actor.role || 'USER'}]`.trim(),
            action: 'SEND_EMAIL',
            entity: 'Mail',
            entityId: info.messageId || 'unknown',
            status: 'SUCCESS',
            newValues: { to: dto.to, subject: dto.subject, messageId: info.messageId, establishmentId, tenantId: actor.tenantId },
          },
        }).catch(err => this.logger.warn(`Failed to write mail audit log: ${err.message}`));
      }

      return new MailSendResultEntity({
        success: true,
        messageId: info.messageId,
      });
    } catch (error: any) {
      this.logger.error(`Mail dispatch failed: ${error.message}`);
      if (actor?.id) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Mail dispatch failed to ${dto.to}: ${error.message}`,
            stack: error.stack,
            context: 'MailService.sendMail',
            userId: actor.id,
          },
        }).catch(err => this.logger.warn(`Failed to write system error log: ${err.message}`));
      }
      return new MailSendResultEntity({
        success: false,
        error: error.message,
      });
    }
  }

  async getConfig(establishmentId: string): Promise<SmtpConfigEntity | null> {
    const config = await this.prisma.smtpConfig.findFirst({
      where: { establishmentId, isDefault: true },
    });
    return config ? new SmtpConfigEntity(config) : null;
  }

  async saveConfig(establishmentId: string, dto: CreateSmtpConfigDto, actor?: any): Promise<SmtpConfigEntity> {
    try {
      if (dto.isDefault) {
        await this.prisma.smtpConfig.updateMany({
          where: { establishmentId },
          data: { isDefault: false },
        });
      }

      const created = await this.prisma.smtpConfig.create({
        data: {
          establishmentId,
          host: dto.host,
          port: dto.port,
          user: dto.user,
          password: dto.password,
          fromName: dto.fromName,
          fromEmail: dto.fromEmail,
          isSecure: dto.isSecure ?? true,
          isDefault: dto.isDefault ?? true,
        },
      });

      if (actor?.id) {
        await this.prisma.auditLog.create({
          data: {
            userId: actor.id,
            actorSnapshot: `${actor.firstName || ''} ${actor.lastName || ''} (@${actor.email || actor.username || 'unknown'}) [${actor.role || 'USER'}]`.trim(),
            action: 'CONFIGURE_SMTP',
            entity: 'SmtpConfig',
            entityId: created.id,
            status: 'SUCCESS',
            newValues: { host: dto.host, port: dto.port, fromEmail: dto.fromEmail, establishmentId, tenantId: actor.tenantId },
          },
        }).catch(err => this.logger.warn(`Failed to write audit log: ${err.message}`));
      }

      return new SmtpConfigEntity(created);
    } catch (error: any) {
      if (actor?.id) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed to save SMTP config: ${error.message}`,
            stack: error.stack,
            context: 'MailService.saveConfig',
            userId: actor?.id,
          },
        }).catch(err => this.logger.warn(`Failed to write system log: ${err.message}`));
      }
      throw error;
    }
  }
}
