import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.username);

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

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.username);

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
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET as string,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.username);

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
        },
      };
    } catch (error) {
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
  ) {
    const payload = { sub: userId, email, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
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
}
