import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateStudentPaymentDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  parentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty({ enum: ['CASH', 'CHECK', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL'] })
  @IsEnum(['CASH', 'CHECK', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL'])
  method: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED'] })
  @IsEnum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED'])
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripePaymentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paypalPaymentId?: string;
}

export class UpdateStudentPaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ required: false, enum: ['CASH', 'CHECK', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL'] })
  @IsOptional()
  @IsEnum(['CASH', 'CHECK', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL'])
  method?: string;

  @ApiProperty({ required: false, enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryStudentPaymentDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false, enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED'])
  status?: string;

  @ApiProperty({ required: false, enum: ['CASH', 'CHECK', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL'] })
  @IsOptional()
  @IsEnum(['CASH', 'CHECK', 'CARD', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL'])
  method?: string;
}
