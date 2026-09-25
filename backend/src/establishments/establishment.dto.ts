import { IsString, IsOptional, IsBoolean, IsEmail, IsUUID, MinLength, IsEnum, IsNumber, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EstablishmentCategory } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateEstablishmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false, enum: ['DAYCARE', 'SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY'] })
  @IsOptional()
  @IsEnum(EstablishmentCategory)
  category?: EstablishmentCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  directorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateIf((o) => o.email !== '' && o.email != null)
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;
}

export class UpdateEstablishmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, enum: ['DAYCARE', 'SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY'] })
  @IsOptional()
  @IsEnum(EstablishmentCategory)
  category?: EstablishmentCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  directorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateIf((o) => o.email !== '' && o.email != null)
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryEstablishmentDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Tenant ID' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSchoolPaymentConfigDto {
  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  allowedMethods?: any[];

  // Stripe School Gateway (Completely Separated)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  stripeEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripeKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripePublishableKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripeSecret?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  stripeTestMode?: boolean;

  @ApiProperty({ required: false, default: 'TND' })
  @IsOptional()
  @IsString()
  stripeCurrency?: string;

  // ClicToPay School Gateway (Monétique Tunisie / SMT - Completely Separated)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  clicToPayEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clicToPayMerchantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clicToPayApiKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clicToPaySecretKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clicToPayTerminalId?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  clicToPayTestMode?: boolean;

  @ApiProperty({ required: false, default: 'TND' })
  @IsOptional()
  @IsString()
  clicToPayCurrency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latePenaltyPercent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  latePenaltyEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  blockAccessOnLate?: boolean;
}
