import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentGatewayType {
  STRIPE = 'STRIPE',
  CLIC_TO_PAY = 'CLIC_TO_PAY',
}

export class UpdatePlatformPaymentConfigDto {
  @ApiProperty({ required: false, default: 'TND' })
  @IsOptional()
  @IsString()
  currency?: string;

  // Stripe
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  stripeEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripePublicKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;

  // ClicToPay
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

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  clicToPayTestMode?: boolean;
}

export class CreateSubscriptionCheckoutDto {
  @ApiProperty({ description: 'SaaS Plan UUID' })
  @IsNotEmpty()
  @IsString()
  planId: string;

  @ApiProperty({ enum: PaymentGatewayType, default: PaymentGatewayType.CLIC_TO_PAY })
  @IsNotEmpty()
  @IsEnum(PaymentGatewayType)
  gateway: PaymentGatewayType;

  @ApiProperty({ description: 'Subscription period in months', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  periodMonths?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

export class ClicToPayCallbackDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  respCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  checksum?: string;
}
