import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/pagination.dto';

export class CreateBulletinDto {
  @ApiProperty({ required: false, description: 'Establishment ID (auto-injected from JWT if omitted)' })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty()
  @IsString()
  periodId: string;

  @ApiProperty()
  @IsNumber()
  totalScore: number;

  @ApiProperty()
  @IsNumber()
  averageScore: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rank?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPromoted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class QueryBulletinDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  periodId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicYearId?: string;
}

export class UpdateBulletinDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  averageScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rank?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPromoted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comments?: string;
}
