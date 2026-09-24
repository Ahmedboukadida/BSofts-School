import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyTotpDto,
} from './auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Optional() private mailService?: MailService,
  ) {}

  async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<AuthResponseDto> {
    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { username: dto.identifier },
        ],
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        student: { select: { id: true, establishmentId: true, registrationNumber: true } },
        parent: { select: { id: true, establishmentId: true } },
        teacher: { select: { id: true, establishmentId: true } },
        employee: { select: { id: true, establishmentId: true } },
      },
    });

    if (!user) {
      await this.logLoginAttempt(null, false, ip, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      await this.logLoginAttempt(user.id, false, ip, userAgent);
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      await this.logLoginAttempt(user.id, false, ip, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await this.logLoginAttempt(user.id, true, ip, userAgent);

    // Determine primary establishment
    const establishmentId =
      user.userRoles?.[0]?.establishmentId ||
      user.teacher?.establishmentId ||
      user.student?.establishmentId ||
      user.employee?.establishmentId ||
      user.parent?.establishmentId ||
      null;

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.username, establishmentId);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isRoot: user.isRoot,
        mustChangePassword: Boolean(user.mustChangePassword),
        userRoles: user.userRoles,
        student: user.student,
        parent: user.parent,
        teacher: user.teacher,
        employee: user.employee,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.username ? { username: dto.username } : {},
        ].filter((obj) => Object.keys(obj).length > 0),
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        phone: dto.phone,
      },
    });

    let tenant: any = null;
    let establishment: any = null;

    if (this.prisma.tenant) {
      try {
        const tenantName = `${dto.firstName} ${dto.lastName} School`;
        const tenantSlug = `${(dto.firstName + '-' + dto.lastName).toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
        tenant = await this.prisma.tenant.create({
          data: {
            name: tenantName,
            slug: tenantSlug,
            userId: user.id,
            status: 'ACTIVE',
          },
        });

        // Attach plan subscription
        let plan: any = null;
        if (dto.planId && this.prisma.saaSPlan) {
          plan = await this.prisma.saaSPlan.findUnique({ where: { id: dto.planId } });
          if (!plan) {
            plan = await this.prisma.saaSPlan.findFirst({
              where: {
                OR: [
                  { name: { contains: dto.planId, mode: 'insensitive' } },
                  { id: dto.planId },
                ],
              },
            });
          }
        }
        if (!plan && this.prisma.saaSPlan) {
          plan = await this.prisma.saaSPlan.findFirst({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
        }

        if (plan && this.prisma.tenantSubscription) {
          await this.prisma.tenantSubscription.create({
            data: {
              tenantId: tenant.id,
              planId: plan.id,
              status: 'ACTIVE',
              startDate: new Date(),
            },
          });
        }

        // Create initial establishment
        if (this.prisma.establishment) {
          establishment = await this.prisma.establishment.create({
            data: {
              tenantId: tenant.id,
              name: `${dto.firstName} ${dto.lastName} Academy`,
              slug: `est-${tenantSlug}`,
              category: 'SCHOOL',
              isActive: true,
            },
          });

          // Assign SUPER_ADMIN role to user
          if (this.prisma.role && this.prisma.userRoleAssignment) {
            const superAdminRole = await this.prisma.role.findFirst({
              where: { code: 'SUPER_ADMIN' },
            });
            if (superAdminRole) {
              await this.prisma.userRoleAssignment.create({
                data: {
                  userId: user.id,
                  roleId: superAdminRole.id,
                  establishmentId: establishment.id,
                },
              });
            }
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not provision tenant/establishment for user ${user.id}: ${err.message}`);
      }
    }

    // Send Welcome Email with official link
    if (dto.email && this.mailService) {
      const frontendUrl = process.env.FRONTEND_URL || 'https://bsofts-school.vercel.app';
      const loginUrl = `${frontendUrl}/login`;
      this.mailService.sendMail(
        {
          to: dto.email,
          subject: 'Bienvenue sur BSofts School / Welcome to BSofts School',
          text: `Bonjour ${dto.firstName},\n\nVotre compte BSofts School a été configuré avec succès.\n\nAccédez à votre espace ici : ${loginUrl}\n\nL'équipe BSofts School`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 16px; overflow: hidden;">
              <div style="background-color: #242F40; padding: 28px 24px; text-align: center;">
                <h1 style="color: #CCA43B; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">BSofts School</h1>
                <p style="color: #FFFFFF; margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Plateforme Éducative Intelligente</p>
              </div>
              <div style="padding: 32px 24px; color: #363636; line-height: 1.6;">
                <h2 style="color: #242F40; font-size: 18px; margin-top: 0;">Bienvenue ${dto.firstName} ${dto.lastName} !</h2>
                <p>Votre compte BSofts School a été créé avec succès avec votre souscription. Vous pouvez dès à présent vous connecter et piloter votre établissement.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${loginUrl}" style="background-color: #CCA43B; color: #242F40; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(204, 164, 59, 0.3);">
                    Accéder à mon Espace BSofts School &rarr;
                  </a>
                </div>
                <p style="font-size: 13px; color: #666666;">Lien direct : <a href="${loginUrl}" style="color: #242F40; word-break: break-all;">${loginUrl}</a></p>
              </div>
              <div style="background-color: #F8F9FA; border-top: 1px solid #E5E5E5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888888;">
                &copy; ${new Date().getFullYear()} BSofts School. Tous droits réservés.
              </div>
            </div>
          `,
        },
        establishment?.id,
      ).catch((err: any) => this.logger.warn(`Failed to dispatch welcome email: ${err.message}`));
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.username,
      establishment?.id,
      tenant?.id,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isRoot: user.isRoot,
        establishmentId: establishment?.id,
        tenantId: tenant?.id,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const refreshSecret =
        process.env.JWT_REFRESH_SECRET ||
        (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'bsofts-school-jwt-refresh-secret-key');

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: { select: { establishmentId: true, role: true } },
          student: { select: { establishmentId: true } },
          teacher: { select: { establishmentId: true } },
          employee: { select: { establishmentId: true } },
          parent: { select: { establishmentId: true } },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const establishmentId =
        user.userRoles?.[0]?.establishmentId ||
        user.teacher?.establishmentId ||
        user.student?.establishmentId ||
        user.employee?.establishmentId ||
        user.parent?.establishmentId ||
        null;

      const tokens = await this.generateTokens(user.id, user.email, user.username, establishmentId);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isRoot: user.isRoot,
          establishmentId: establishmentId || undefined,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isRoot: true,
        isActive: true,
        createdAt: true,
        userRoles: {
          select: {
            id: true,
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            establishmentId: true,
          },
        },
        student: { select: { id: true, establishmentId: true, registrationNumber: true } },
        parent: { select: { id: true, establishmentId: true } },
        teacher: { select: { id: true, establishmentId: true } },
        employee: { select: { id: true, establishmentId: true } },
      },
    });

    return user;
  }

  private async generateTokens(
    userId: string,
    email: string | null,
    username: string | null,
    establishmentId?: string | null,
    tenantId?: string | null,
  ) {
    const payload = {
      sub: userId,
      email,
      username,
      establishmentId: establishmentId || null,
      tenantId: tenantId || null,
    };

    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'bsofts-school-jwt-refresh-secret-key');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: (process.env.JWT_EXPIRATION as any) || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION as any) || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async logLoginAttempt(
    userId: string | null,
    success: boolean,
    ip?: string,
    userAgent?: string,
  ) {
    if (userId) {
      await this.prisma.loginLog.create({
        data: {
          userId,
          success,
          ipAddress: ip,
          userAgent,
        },
      });
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: dto.email.trim(), mode: 'insensitive' },
        isDeleted: false,
      },
    });

    if (!user) {
      return {
        success: true,
        message: 'Si cette adresse email existe, un lien de réinitialisation vous a été envoyé.',
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: rawToken,
        resetPasswordExpires: expires,
      },
    });

    if (this.mailService && user.email) {
      const appUrl = process.env.APP_URL || 'https://bsofts-school.onrender.com';
      const resetUrl = `${appUrl}/auth/reset-password?token=${rawToken}`;
      await this.mailService
        .sendMail({
          to: user.email,
          subject: 'Réinitialisation de votre mot de passe - BSofts School',
          text: `Bonjour ${user.firstName},\n\nVous avez demandé la réinitialisation de votre mot de passe.\nCliquez sur ce lien (valable 1h) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, veuillez l'ignorer.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
              <h2 style="color: #242F40;">Réinitialisation de votre mot de passe</h2>
              <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
              <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte BSofts School.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #CCA43B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Réinitialiser mon mot de passe
                </a>
              </p>
              <p style="color: #666; font-size: 13px;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            </div>
          `,
        })
        .catch((err: any) => this.logger.warn(`Failed to dispatch reset email: ${err.message}`));
    }

    return {
      success: true,
      message: 'Si cette adresse email existe, un lien de réinitialisation vous a été envoyé.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gt: new Date() },
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Le jeton de réinitialisation est invalide ou a expiré.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        mustChangePassword: false,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: dto.token,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Jeton de validation d\'email invalide ou introuvable.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return {
      success: true,
      message: 'Adresse email vérifiée avec succès.',
    };
  }

  async enableTotp(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const secretHex = crypto.randomBytes(20).toString('hex');
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secretHex,
      },
    });

    const issuer = 'BSoftsSchool';
    const account = encodeURIComponent(user.email || user.username || 'user');
    const otpauthUri = `otpauth://totp/${issuer}:${account}?secret=${secretHex}&issuer=${issuer}`;

    return {
      success: true,
      secret: secretHex,
      otpauthUri,
      message: 'Scannez cet URI ou renseignez le secret dans votre application Authenticator, puis confirmez avec un code à 6 chiffres.',
    };
  }

  async verifyTotp(userId: string, dto: VerifyTotpDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Configuration 2FA non initialisée. Veuillez appeler totp/enable.');
    }

    const isValid = this.checkTotp(dto.code, user.twoFactorSecret);
    if (!isValid) {
      throw new BadRequestException('Code 2FA invalide ou expiré.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });

    return {
      success: true,
      message: 'Authentification à deux facteurs (2FA) activée avec succès.',
    };
  }

  private checkTotp(code: string, secretHex: string): boolean {
    const epoch = Math.floor(Date.now() / 1000);
    for (const drift of [-30, 0, 30]) {
      const time = Math.floor((epoch + drift) / 30);
      const buf = Buffer.alloc(8);
      buf.writeBigInt64BE(BigInt(time));
      const hmac = crypto.createHmac('sha1', Buffer.from(secretHex, 'hex'));
      hmac.update(buf);
      const digest = hmac.digest();
      const offset = digest[digest.length - 1] & 0x0f;
      const binary =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);
      const otp = (binary % 1000000).toString().padStart(6, '0');
      if (otp === code.trim()) {
        return true;
      }
    }
    return false;
  }
}
