import { IsString, IsOptional, IsNumber, IsBoolean, IsIn, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateHomeworkDto {
  @ApiProperty({ description: 'Homework title', example: 'Série d’exercices N°1' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description / instructions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Class Name', example: '4-MATH (Bac)' })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiPropertyOptional({ description: 'Subject / Matière Name', example: 'Mathématiques' })
  @IsOptional()
  @IsString()
  matiereName?: string;

  @ApiPropertyOptional({ description: 'Assigned Date (YYYY-MM-DD)', example: '2026-09-12' })
  @IsOptional()
  @IsString()
  assignedDate?: string;

  @ApiPropertyOptional({ description: 'Due Date (YYYY-MM-DD)', example: '2026-09-18' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Total students in class', example: 32 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalStudents?: number;

  @ApiPropertyOptional({ description: 'Homework status', enum: ['OPEN', 'SUBMITTED', 'GRADED', 'EXPIRED'] })
  @IsOptional()
  @IsIn(['OPEN', 'SUBMITTED', 'GRADED', 'EXPIRED'])
  status?: 'OPEN' | 'SUBMITTED' | 'GRADED' | 'EXPIRED';

  @ApiPropertyOptional({ description: 'Class ID' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Matiere ID' })
  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @ApiPropertyOptional({ description: 'Establishment ID' })
  @IsOptional()
  @IsUUID()
  establishmentId?: string;
}

export class UpdateHomeworkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  className?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  matiereName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalStudents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['OPEN', 'SUBMITTED', 'GRADED', 'EXPIRED'])
  status?: 'OPEN' | 'SUBMITTED' | 'GRADED' | 'EXPIRED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class QueryHomeworkDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  className?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @ApiPropertyOptional({ description: 'Alias for includeDeleted' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isDeleted?: boolean;
}
