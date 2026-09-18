import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Email subject line' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Plain text content', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ description: 'HTML formatted content', required: false })
  @IsOptional()
  @IsString()
  html?: string;
}

export class CreateSmtpConfigDto {
  @ApiProperty({ description: 'SMTP Host server' })
  @IsString()
  host: string;

  @ApiProperty({ description: 'SMTP Port (465, 587, 25)' })
  @IsNumber()
  @Min(1)
  port: number;

  @ApiProperty({ description: 'SMTP username / email' })
  @IsString()
  user: string;

  @ApiProperty({ description: 'SMTP password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Sender display name' })
  @IsString()
  fromName: string;

  @ApiProperty({ description: 'Sender email address' })
  @IsEmail()
  fromEmail: string;

  @ApiProperty({ description: 'SSL/TLS secure connection', default: true })
  @IsOptional()
  @IsBoolean()
  isSecure?: boolean;

  @ApiProperty({ description: 'Set as default SMTP config for establishment', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class TestSmtpDto {
  @ApiProperty({ description: 'Destination email address for test message' })
  @IsEmail()
  testEmail: string;
}
