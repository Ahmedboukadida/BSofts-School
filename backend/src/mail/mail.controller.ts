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
    const establishmentId = req.user?.establishmentId;
    return this.mailService.sendMail(dto, establishmentId, req.user);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test SMTP connectivity and dispatch test message' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async testSmtp(@Body() dto: TestSmtpDto, @Req() req: any): Promise<MailSendResultEntity> {
    const establishmentId = req.user?.establishmentId;
    return this.mailService.sendMail(
      {
        to: dto.testEmail,
        subject: 'BSofts School — SMTP Test Notification',
        text: 'This is a verification email from your BSofts School educational management system.',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2563eb;">BSofts School Platform</h2>
            <p>Your SMTP mail configuration is verified and functioning correctly.</p>
            <p style="color: #64748b; font-size: 12px;">Sent automatically by BSofts School Educational Engine.</p>
          </div>
        `,
      },
      establishmentId,
      req.user,
    );
  }

  @Get('config')
  @ApiOperation({ summary: 'Get active SMTP configuration for current establishment' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async getConfig(@Req() req: any): Promise<SmtpConfigEntity | null> {
    const establishmentId = req.user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('No active establishment context found');
    }
    return this.mailService.getConfig(establishmentId);
  }

  @Post('config')
  @ApiOperation({ summary: 'Configure or update SMTP settings for establishment' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async saveConfig(@Body() dto: CreateSmtpConfigDto, @Req() req: any): Promise<SmtpConfigEntity> {
    const establishmentId = req.user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('No active establishment context found');
    }
    return this.mailService.saveConfig(establishmentId, dto, req.user);
  }
}
