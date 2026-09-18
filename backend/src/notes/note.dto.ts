import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  matiereId: string;

  @ApiProperty()
  @IsString()
  periodId: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  examId?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxValue: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  coefficient: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gradedBy?: string;
}

export class UpdateNoteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class QueryNoteDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  matiereId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  periodId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicYearId?: string;
}

export class BulkGradeItemDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  continuousScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  examScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  average?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  appreciation?: string;
}

export class BulkSaveNotesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty()
  @IsString()
  matiereId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  periodId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ApiProperty({ type: [BulkGradeItemDto] })
  grades: BulkGradeItemDto[];
}
