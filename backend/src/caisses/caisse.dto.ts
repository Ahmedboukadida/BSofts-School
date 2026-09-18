import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateCaisseDto {
  @ApiProperty()
  @IsString()
  establishmentId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['MAIN', 'PETTY_CASH', 'BANK', 'SALARY', 'OTHER'] })
  @IsEnum(['MAIN', 'PETTY_CASH', 'BANK', 'SALARY', 'OTHER'])
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCaisseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryCaisseDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false, enum: ['MAIN', 'PETTY_CASH', 'BANK', 'SALARY', 'OTHER'] })
  @IsOptional()
  @IsEnum(['MAIN', 'PETTY_CASH', 'BANK', 'SALARY', 'OTHER'])
  type?: string;

  @ApiProperty({ required: false, description: 'Include inactive/soft-deleted items' })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}
