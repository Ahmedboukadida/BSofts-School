import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/pagination.dto';

export class CreatePaymentPlanDto {
  @ApiProperty({ required: false, description: 'Establishment ID (auto-injected from JWT if omitted)' })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classLevelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ enum: ['ONE_TIME', 'RECURRING', 'ENROLLMENT', 'TUITION', 'CUSTOM'] })
  @IsEnum(['ONE_TIME', 'RECURRING', 'ENROLLMENT', 'TUITION', 'CUSTOM'])
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false, default: 'DZD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false, enum: ['MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY'] })
  @IsOptional()
  @IsEnum(['MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY'])
  recurringPeriod?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class QueryPaymentPlanDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classLevelId?: string;
}

export class UpdatePaymentPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classLevelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false, enum: ['ONE_TIME', 'RECURRING', 'ENROLLMENT', 'TUITION', 'CUSTOM'] })
  @IsOptional()
  @IsEnum(['ONE_TIME', 'RECURRING', 'ENROLLMENT', 'TUITION', 'CUSTOM'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false, enum: ['MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY'] })
  @IsOptional()
  @IsEnum(['MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY'])
  recurringPeriod?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
