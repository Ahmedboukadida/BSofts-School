import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  caisseId: string;

  @ApiProperty({ enum: ['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'PENALTY'] })
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'PENALTY'])
  type: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  performedBy?: string;
}

export class QueryTransactionDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  caisseId?: string;

  @ApiProperty({ required: false, enum: ['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'PENALTY'] })
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'PENALTY'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;
}
