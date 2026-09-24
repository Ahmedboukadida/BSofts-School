import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsDateString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateExamDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  periodId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  matiereId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['QUIZ', 'MIDTERM', 'FINAL', 'HOMEWORK', 'PRACTICAL', 'OTHER'] })
  @IsEnum(['QUIZ', 'MIDTERM', 'FINAL', 'HOMEWORK', 'PRACTICAL', 'OTHER'])
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  antiCheat?: boolean;
}

export class UpdateExamDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'GRADED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'GRADED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

export class QueryExamDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  periodId?: string;

  @ApiProperty({ required: false, enum: ['QUIZ', 'MIDTERM', 'FINAL', 'HOMEWORK', 'PRACTICAL', 'OTHER'] })
  @IsOptional()
  @IsEnum(['QUIZ', 'MIDTERM', 'FINAL', 'HOMEWORK', 'PRACTICAL', 'OTHER'])
  type?: string;

  @ApiProperty({ required: false, enum: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'GRADED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'GRADED'])
  status?: string;
}

export class AddQuestionDto {
  @ApiProperty({ enum: ['QCM', 'TRUE_FALSE', 'SHORT_ANSWER', 'FREE_TEXT', 'FILE_UPLOAD'] })
  @IsEnum(['QCM', 'TRUE_FALSE', 'SHORT_ANSWER', 'FREE_TEXT', 'FILE_UPLOAD'])
  type: string;

  @ApiProperty({ description: 'Question text / prompt' })
  @IsString()
  @MinLength(3)
  content: string;

  @ApiProperty({ required: false, description: 'Options for QCM / True-False with id, text, and isCorrect' })
  @IsOptional()
  options?: any;

  @ApiProperty({ default: 1 })
  @IsNumber()
  maxScore: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateQuestionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  options?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class ExamAnswerItemDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class SubmitExamDto {
  @ApiProperty({ type: [ExamAnswerItemDto] })
  answers: ExamAnswerItemDto[];

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  tabSwitches?: number;
}

