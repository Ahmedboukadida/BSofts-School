import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class MarkTeacherAttendanceDto {
  @ApiProperty()
  @IsString()
  teacherId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiProperty({ enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] })
  @IsEnum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status: string;

  @ApiProperty({ required: false, enum: ['MANUAL', 'QR_CODE', 'GPS'] })
  @IsOptional()
  @IsEnum(['MANUAL', 'QR_CODE', 'GPS'])
  source?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  markedBy?: string;
}

export class QueryTeacherAttendanceDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
