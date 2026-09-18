import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ enum: ['ATTENDANCE', 'EXAM_RESULTS', 'FINANCIAL', 'ENROLLMENT', 'TEACHER_PERFORMANCE', 'CLASS_PERFORMANCE', 'PAYMENT_COLLECTION', 'OVERVIEW'] })
  @IsEnum([
    'ATTENDANCE', 'EXAM_RESULTS', 'FINANCIAL', 'ENROLLMENT',
    'TEACHER_PERFORMANCE', 'CLASS_PERFORMANCE', 'PAYMENT_COLLECTION', 'OVERVIEW'
  ])
  reportType: string;

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
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studentId?: string;
}
