import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateClassDto {
  @ApiProperty({ required: false, description: 'Establishment ID (auto-injected from JWT if omitted)' })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty()
  @IsString()
  classLevelId: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ enum: ['TRIMESTER', 'SEMESTER'], required: false, default: 'TRIMESTER' })
  @IsOptional()
  @IsEnum(['TRIMESTER', 'SEMESTER'])
  periodType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gradingConfigId?: string;
}

export class UpdateClassDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gradingConfigId?: string;
}

export class QueryClassDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classLevelId?: string;

  @ApiProperty({ required: false, description: 'Retrieve soft-deleted/trash items' })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}
