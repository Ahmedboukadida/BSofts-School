import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import * as dns from 'node:dns';
import { PrismaService } from '../prisma/prisma.service';
import { SendEmailDto, CreateSmtpConfigDto } from './mail.dto';
import { SmtpConfigEntity, MailSendResultEntity } from './mail.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async resolveConfig(establishmentId?: string): Promise<{
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
    resendApiKey?: string;
  }> {
    let host = process.env.SMTP_HOST || 'smtp.gmail.com';
    let port = parseInt(process.env.SMTP_PORT || (host.includes('gmail') ? '465' : '587'), 10);
    let secure = process.env.SMTP_SECURE === 'true' || port === 465;
    let user = process.env.SMTP_USER || '';
    let pass = process.env.SMTP_PASSWORD || '';
    let fromName = 'BSofts School';
    let fromEmail = process.env.SMTP_FROM || 'no-reply@bsofts-school.com';
    let resendApiKey = process.env.RESEND_API_KEY || '';

    let config = establishmentId
      ? await this.prisma.smtpConfig.findFirst({
          where: { establishmentId, isDefault: true },
        })
      : await this.prisma.smtpConfig.findFirst({
          where: { isDefault: true },
        });

    if (!config) {
      try {
        const platformSetting = await this.prisma.platformSetting.findUnique({
          where: { key: 'SMTP_CONFIG' },
        });
        if (platformSetting?.value) {
          const parsed = JSON.parse(platformSetting.value);
          host = parsed.host || host;
          port = parsed.port ? parseInt(parsed.port, 10) : (host.includes('gmail') ? 465 : port);
          secure = parsed.isSecure ?? (port === 465);
          user = parsed.user || user;
          pass = parsed.password || pass;
          if (parsed.fromName) fromName = parsed.fromName;
          if (parsed.fromEmail) fromEmail = parsed.fromEmail;
          if (parsed.resendApiKey) resendApiKey = parsed.resendApiKey;
        }
      } catch (err) {
        // Fallback to env variables
      }
    } else {
      host = config.host;
      port = config.port;
      secure = config.isSecure || config.port === 465;
      user = config.user;
      pass = config.password;
      if (config.fromName) fromName = config.fromName;
      if (config.fromEmail) fromEmail = config.fromEmail;
    }

    if (user) user = user.trim();
    if (pass) {
      pass = pass.trim();
      if (host.includes('gmail')) {
        pass = pass.replace(/\s+/g, '');
      }
    }
    if (resendApiKey) resendApiKey = resendApiKey.trim();

    if (!resendApiKey && (!user || !pass)) {
      throw new BadRequestException(
        "Configuration messagerie incomplète : veuillez renseigner vos identifiants SMTP ou une clé API Resend dans Paramètres > Configuration SMTP."
      );
    }

    return { host, port, secure, user, pass, fromName, fromEmail, resendApiKey };
  }

  async getTransporter(establishmentId?: string): Promise<{ transporter: nodemailer.Transporter; host: string; port: number }> {
    const config = await this.resolveConfig(establishmentId);

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure || config.port === 465,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      // Force IPv4 socket resolution to prevent ENETUNREACH on cloud containers without IPv6 routing (Render, AWS)
      // @ts-ignore
      lookup: (hostname: string, _options: any, callback: any) => {
        dns.lookup(hostname, { family: 4 }, callback);
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return { transporter, host: config.host, port: config.port };
  }

  async sendMail(dto: SendEmailDto, establishmentId?: string, actor?: any): Promise<MailSendResultEntity> {
    let resolved;
    try {
      resolved = await this.resolveConfig(establishmentId);
    } catch (cfgErr: any) {
      return new MailSendResultEntity({ success: false, error: cfgErr.message });
    }

    const { host, port, secure, user, pass, fromName, fromEmail, resendApiKey } = resolved;
    const fromHeader = `"${fromName}" <${fromEmail}>`;

    const sendViaResend = async (apiKey: string) => {
      const isCustomDomain = fromEmail && !fromEmail.includes('@gmail.com') && !fromEmail.includes('@yahoo.com') && !fromEmail.includes('@outlook.com');
      const sender = isCustomDomain ? fromHeader : `BSofts School <onboarding@resend.dev>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: [dto.to],
          subject: dto.subject,
          text: dto.text,
          html: dto.html,
        }),
      });

      const body: any = await res.json();
      if (!res.ok) {
        throw new Error(body.message || body.error?.message || 'Erreur lors de l’envoi via Resend API');
      }
      return { messageId: body.id };
    };

    const sendWithParams = async (targetPort: number, isSecure: boolean) => {
      const tr = nodemailer.createTransport({
        host,
        port: targetPort,
        secure: isSecure,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        // Force IPv4 lookup to prevent ENETUNREACH on cloud environments without IPv6 routing
        // @ts-ignore
        lookup: (hostname: string, _options: any, callback: any) => {
          dns.lookup(hostname, { family: 4 }, callback);
        },
        tls: { rejectUnauthorized: false },
      });
      return tr.sendMail({
        from: fromHeader,
        to: dto.to,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
      });
    };

    try {
      let info: { messageId?: string } = {};

      if (resendApiKey) {
        this.logger.log(`Dispatching email to ${dto.to} via Resend HTTPS API (Port 443)...`);
        info = await sendViaResend(resendApiKey);
      } else {
        try {
          info = await sendWithParams(port, secure);
        } catch (firstAttemptErr: any) {
          // If port 587 timed out on Gmail, automatically fallback to port 465 with SSL
          const isTimeout =
            firstAttemptErr.message?.includes('timeout') ||
            firstAttemptErr.code === 'ETIMEDOUT' ||
            firstAttemptErr.code === 'ESOCKETTIMEDOUT';
          if (host.includes('gmail') && port === 587 && isTimeout) {
            this.logger.warn(`Port 587 timed out on cloud network. Retrying automatically on Port 465 with SSL...`);
            info = await sendWithParams(465, true);
          } else {
            throw firstAttemptErr;
          }
        }
      }

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
      let friendlyError = error.message;
      if (error.message?.includes('ENETUNREACH') || error.code === 'ENETUNREACH') {
        friendlyError = `Erreur réseau (ENETUNREACH IPv6). La passerelle a été reconfigurée pour forcer l'IPv4. Veuillez réessayer l'envoi vers ${host}:${port}.`;
      } else if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
        friendlyError = "Délai d'attente dépassé (Connection timeout). Sur le plan gratuit de Render, les ports SMTP sortants (25, 465, 587) sont bloqués au niveau du pare-feu cloud. Solutions : 1) Renseignez une clé API Resend gratuite dans Paramètres > Configuration SMTP (fonctionne sur port 443 HTTPS sans aucun blocage), ou 2) Démarrez le backend en local ou passez Render sur un plan payant (Starter $7/mois).";
      } else if (error.message?.includes('Invalid login') || error.message?.includes('535') || error.message?.includes('Username and Password not accepted')) {
        friendlyError = "Identifiants SMTP rejetés par le serveur (535). Pour Gmail, vous devez utiliser un 'Mot de passe d'application' (16 caractères sans espaces) généré sur votre compte Google, et non le mot de passe habituel de votre compte.";
      }

      this.logger.error(`Mail dispatch failed: ${friendlyError}`);
      if (actor?.id) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Mail dispatch failed to ${dto.to}: ${friendlyError}`,
            stack: error.stack,
            context: 'MailService.sendMail',
            userId: actor.id,
          },
        }).catch(err => this.logger.warn(`Failed to write system error log: ${err.message}`));
      }
      return new MailSendResultEntity({
        success: false,
        error: friendlyError,
      });
    }
  }

  async getConfig(establishmentId?: string): Promise<SmtpConfigEntity | null> {
    const config = establishmentId
      ? await this.prisma.smtpConfig.findFirst({
          where: { establishmentId, isDefault: true },
        })
      : await this.prisma.smtpConfig.findFirst({
          where: { isDefault: true },
        });

    if (config) {
      return new SmtpConfigEntity(config);
    }

    try {
      const platformSetting = await this.prisma.platformSetting.findUnique({
        where: { key: 'SMTP_CONFIG' },
      });
      if (platformSetting?.value) {
        const parsed = JSON.parse(platformSetting.value);
        return new SmtpConfigEntity({
          id: 'platform-global',
          establishmentId: establishmentId || 'global',
          host: parsed.host || '',
          port: parsed.port || 465,
          user: parsed.user || '',
          password: parsed.password || '',
          fromName: parsed.fromName || 'BSofts School',
          fromEmail: parsed.fromEmail || '',
          isSecure: parsed.isSecure ?? true,
          isDefault: true,
          resendApiKey: parsed.resendApiKey || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (e) {}

    return null;
  }

  async saveConfig(establishmentId: string | undefined, dto: CreateSmtpConfigDto, actor?: any): Promise<SmtpConfigEntity> {
    try {
      // 1. Always sync to global PlatformSetting so any establishment without custom config inherits it
      await this.prisma.platformSetting.upsert({
        where: { key: 'SMTP_CONFIG' },
        update: {
          value: JSON.stringify(dto),
          category: 'COMMUNICATION',
          isPublic: false,
        },
        create: {
          key: 'SMTP_CONFIG',
          value: JSON.stringify(dto),
          category: 'COMMUNICATION',
          isPublic: false,
        },
      });

      // 2. If establishmentId is provided and valid in DB, also upsert establishment record
      if (establishmentId && establishmentId !== 'global') {
        const est = await this.prisma.establishment.findUnique({
          where: { id: establishmentId },
        });

        if (est) {
          const existing = await this.prisma.smtpConfig.findFirst({
            where: { establishmentId },
          });

          let saved;
          if (existing) {
            saved = await this.prisma.smtpConfig.update({
              where: { id: existing.id },
              data: {
                host: dto.host,
                port: dto.port,
                user: dto.user,
                password: dto.password,
                fromName: dto.fromName,
                fromEmail: dto.fromEmail,
                isSecure: dto.isSecure ?? (dto.port === 465),
                isDefault: true,
              },
            });
          } else {
            saved = await this.prisma.smtpConfig.create({
              data: {
                establishmentId,
                host: dto.host,
                port: dto.port,
                user: dto.user,
                password: dto.password,
                fromName: dto.fromName,
                fromEmail: dto.fromEmail,
                isSecure: dto.isSecure ?? (dto.port === 465),
                isDefault: true,
              },
            });
          }

          if (actor?.id) {
            await this.prisma.auditLog.create({
              data: {
                userId: actor.id,
                actorSnapshot: `${actor.firstName || ''} ${actor.lastName || ''} (@${actor.email || actor.username || 'unknown'}) [${actor.role || 'USER'}]`.trim(),
                action: 'CONFIGURE_SMTP',
                entity: 'SmtpConfig',
                entityId: saved.id,
                status: 'SUCCESS',
                newValues: { host: dto.host, port: dto.port, fromEmail: dto.fromEmail, establishmentId, tenantId: actor.tenantId },
              },
            }).catch(err => this.logger.warn(`Failed to write audit log: ${err.message}`));
          }

          return new SmtpConfigEntity(saved);
        } else {
          this.logger.warn(`Establishment ID ${establishmentId} does not exist in DB (session may be in global mode). Persisted as platform-wide SMTP configuration.`);
        }
      }

      return new SmtpConfigEntity({
        id: 'platform-global',
        establishmentId: 'global',
        host: dto.host,
        port: dto.port,
        user: dto.user,
        password: dto.password,
        fromName: dto.fromName,
        fromEmail: dto.fromEmail,
        isSecure: dto.isSecure ?? (dto.port === 465),
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
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
