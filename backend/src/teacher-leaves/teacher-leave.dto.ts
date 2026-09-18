import { IsString, IsOptional, IsEnum, IsDateString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateTeacherLeaveDto {
  @ApiProperty()
  @IsString()
  teacherId: string;

  @ApiProperty({ enum: ['SICK', 'PERSONAL', 'VACATION', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'OTHER'] })
  @IsEnum(['SICK', 'PERSONAL', 'VACATION', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'OTHER'])
  type: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateLeaveStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}

export class QueryTeacherLeaveDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status?: string;
}
