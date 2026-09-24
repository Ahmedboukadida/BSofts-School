import { Controller, Post, Get, Body, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendEmailDto, CreateSmtpConfigDto, TestSmtpDto } from './mail.dto';
import { SmtpConfigEntity, MailSendResultEntity } from './mail.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Mail & SMTP')
@Controller('mail')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send transactional email' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'STAFF')
  async sendEmail(@Body() dto: SendEmailDto, @Req() req: any): Promise<MailSendResultEntity> {
    const isRoot = req?.user?.isRoot || req?.user?.role === 'ROOT' || req?.user?.roles?.includes('ROOT');
    const establishmentId = isRoot ? undefined : ((req?.headers?.['x-establishment-id'] as string) || req?.user?.establishmentId);
    return this.mailService.sendMail(dto, establishmentId, req.user);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test SMTP connectivity and dispatch test message' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async testSmtp(@Body() dto: TestSmtpDto, @Req() req: any): Promise<MailSendResultEntity> {
    const isRoot = req?.user?.isRoot || req?.user?.role === 'ROOT' || req?.user?.roles?.includes('ROOT');
    const establishmentId = isRoot ? undefined : ((req?.headers?.['x-establishment-id'] as string) || req?.user?.establishmentId);
    const frontendUrl = process.env.FRONTEND_URL || 'https://bsofts-school.vercel.app';
    const settingsUrl = `${frontendUrl}/admin/settings`;
    return this.mailService.sendMail(
      {
        to: dto.testEmail,
        subject: 'BSofts School — Diagnostic et Test de Connexion SMTP',
        text: `BSofts School — Test de messagerie réussi.\n\nVotre serveur SMTP est opérationnel.\nLien : ${settingsUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 16px; overflow: hidden;">
            <div style="background-color: #242F40; padding: 24px; text-align: center;">
              <h1 style="color: #CCA43B; margin: 0; font-size: 22px; font-weight: bold;">BSofts School</h1>
              <p style="color: #FFFFFF; margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Notification de Test & Diagnostic SMTP</p>
            </div>
            <div style="padding: 28px 24px; color: #363636; line-height: 1.6;">
              <h2 style="color: #242F40; font-size: 17px; margin-top: 0;">Configuration SMTP Opérationnelle</h2>
              <p>Ce message confirme que votre passerelle SMTP est correctement reliée et fonctionnelle pour l'envoi des emails transactionnels, relevés de notes et notifications scolaires.</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${settingsUrl}" style="background-color: #CCA43B; color: #242F40; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block;">
                  Accéder aux Paramètres BSofts School &rarr;
                </a>
              </div>
              <p style="font-size: 12px; color: #777777;">Expédié par le moteur de communication BSofts School.</p>
            </div>
            <div style="background-color: #F8F9FA; border-top: 1px solid #E5E5E5; padding: 14px 24px; text-align: center; font-size: 11px; color: #888888;">
              &copy; ${new Date().getFullYear()} BSofts School. Tous droits réservés.
            </div>
          </div>
        `,
      },
      establishmentId,
      req.user,
    );
  }

  @Get('config')
  @ApiOperation({ summary: 'Get active SMTP configuration for current establishment or platform' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async getConfig(@Req() req: any): Promise<SmtpConfigEntity | null> {
    const isRoot = req?.user?.isRoot || req?.user?.role === 'ROOT' || req?.user?.roles?.includes('ROOT');
    const establishmentId = isRoot ? undefined : ((req?.headers?.['x-establishment-id'] as string) || req?.user?.establishmentId);
    if (!isRoot && !establishmentId) {
      throw new BadRequestException('Establishment context required');
    }
    return this.mailService.getConfig(establishmentId);
  }

  @Post('config')
  @ApiOperation({ summary: 'Configure or update SMTP settings for establishment or platform' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async saveConfig(@Body() dto: CreateSmtpConfigDto, @Req() req: any): Promise<SmtpConfigEntity> {
    const isRoot = req.user?.isRoot || req.user?.role === 'ROOT' || req.user?.roles?.includes('ROOT');
    const establishmentId = isRoot ? undefined : ((req.headers['x-establishment-id'] as string) || req.user?.establishmentId);
    return this.mailService.saveConfig(establishmentId, dto, req.user);
  }
}
