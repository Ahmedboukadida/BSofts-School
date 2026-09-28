import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PermissionRefDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;
}

export class CreateSaaSFunctionDto {
  @ApiProperty({ description: 'Display name of the function' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Unique code identifier' })
  @IsString()
  @MinLength(2)
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  moduleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  moduleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  selectedPermissionIds?: string[];

  @ApiProperty({ required: false, type: [PermissionRefDto] })
  @IsOptional()
  @IsArray()
  permissions?: { id: string; code: string; name: string }[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rolesCount?: number;
}

export class UpdateSaaSFunctionDto {
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
  @IsString()
  moduleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  moduleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  selectedPermissionIds?: string[];

  @ApiProperty({ required: false, type: [PermissionRefDto] })
  @IsOptional()
  @IsArray()
  permissions?: { id: string; code: string; name: string }[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rolesCount?: number;
}

export class QuerySaaSFunctionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  moduleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
