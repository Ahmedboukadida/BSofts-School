import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/pagination.dto';

export class CreateEmployeeContractDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty({ enum: ['HOURLY', 'MONTHLY', 'YEARLY', 'PER_FORMATION', 'PER_SESSION', 'CUSTOM'] })
  @IsEnum(['HOURLY', 'MONTHLY', 'YEARLY', 'PER_FORMATION', 'PER_SESSION', 'CUSTOM'])
  type: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiProperty({ required: false, default: 'DZD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class QueryEmployeeContractDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class UpdateEmployeeContractDto {
  @ApiProperty({ required: false, enum: ['HOURLY', 'MONTHLY', 'YEARLY', 'PER_FORMATION', 'PER_SESSION', 'CUSTOM'] })
  @IsOptional()
  @IsEnum(['HOURLY', 'MONTHLY', 'YEARLY', 'PER_FORMATION', 'PER_SESSION', 'CUSTOM'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
