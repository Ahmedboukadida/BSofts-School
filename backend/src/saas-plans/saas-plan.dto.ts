import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Currency } from '@prisma/client';

export class CreateSaaSPlanDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY', 'LIFETIME'] })
  @IsEnum(['MONTHLY', 'YEARLY', 'LIFETIME'])
  interval: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxTeachers?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxStorageGb?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  features?: any;
}

export class UpdateSaaSPlanDto {
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
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false, enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ required: false, enum: ['MONTHLY', 'YEARLY', 'LIFETIME'] })
  @IsOptional()
  @IsEnum(['MONTHLY', 'YEARLY', 'LIFETIME'])
  interval?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxTeachers?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxStorageGb?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  features?: any;
}

export class QuerySaaSPlanDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean | string;
}

