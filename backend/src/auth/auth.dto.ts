import { IsString, IsEmail, IsOptional, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email or username' })
  @IsNotEmpty()
  @IsString()
  identifier: string; // email or username

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, description: 'Selected SaaS subscription plan ID' })
  @IsOptional()
  @IsString()
  planId?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
  @ApiProperty({ description: 'User details' })
  user: {
    id: string;
    email: string | null;
    username: string | null;
    firstName: string;
    lastName: string;
    isRoot: boolean;
    mustChangePassword?: boolean;
    establishmentId?: string;
    tenantId?: string;
    userRoles?: unknown[];
    student?: unknown;
    parent?: unknown;
    teacher?: unknown;
    employee?: unknown;
  };
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password (min 6 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Registered email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token received via email' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password (min 6 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token' })
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class VerifyTotpDto {
  @ApiProperty({ description: '6-digit TOTP code' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

