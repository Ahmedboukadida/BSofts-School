import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateStudentDto {
  @ApiProperty({ required: false, description: 'Establishment ID (auto-injected from JWT if omitted)' })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ required: false, description: 'Date of birth' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, enum: ['MALE', 'FEMALE'] })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE'])
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false, description: 'Unique registration number / matricule' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ required: false, description: 'Alias for registrationNumber' })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({ required: false, description: 'Email to create a linked user account' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false, description: 'Class ID to assign the student to' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false, description: 'Class name' })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiProperty({ required: false, description: 'Academic year label' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({ required: false, description: 'Parent / Guardian full name' })
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiProperty({ required: false, description: 'Parent phone number' })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiProperty({ required: false, description: 'Parent email' })
  @IsOptional()
  @IsString()
  parentEmail?: string;

  @ApiProperty({ required: false, description: 'Payment status' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiProperty({ required: false, description: 'Tuition due in TND' })
  @IsOptional()
  @IsNumber()
  tuitionDue?: number;

  @ApiProperty({ required: false, description: 'Tuition paid in TND' })
  @IsOptional()
  @IsNumber()
  tuitionPaid?: number;

  @ApiProperty({ required: false, description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'User ID (existing user to link)' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateStudentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, description: 'Date of birth' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, enum: ['MALE', 'FEMALE'] })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE'])
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tuitionDue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tuitionPaid?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryStudentDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Establishment ID' })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'Include inactive/soft-deleted students' })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}
