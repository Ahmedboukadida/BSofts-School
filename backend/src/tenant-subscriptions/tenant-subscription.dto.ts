import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateTenantSubscriptionDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Plan ID' })
  @IsString()
  planId: string;

  @ApiProperty({ required: false, enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'])
  status?: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false, description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateTenantSubscriptionDto {
  @ApiProperty({ required: false, description: 'Plan ID' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({ required: false, enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'])
  status?: string;

  @ApiProperty({ required: false, description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class QueryTenantSubscriptionDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Tenant ID' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ required: false, enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'])
  status?: string;
}

export class RenewTenantSubscriptionDto {
  @ApiProperty({ description: 'Number of months to add' })
  @IsOptional()
  months?: number;

  @ApiProperty({ required: false, description: 'New price' })
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false, description: 'New end date' })
  @IsOptional()
  @IsDateString()
  newEndDate?: string;
}

export class ApproveTenantSubscriptionDto {
  @ApiProperty({ required: false, description: 'Approver name/identity' })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}
