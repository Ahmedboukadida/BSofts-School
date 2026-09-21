import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Module ID', required: false })
  @IsOptional()
  @IsString()
  moduleId?: string;

  @ApiProperty({ description: 'Module Name or Code', required: false })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  roles?: string[];
}

export class UpdatePermissionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  roles?: string[];
}

export class QueryPermissionDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Module ID' })
  @IsOptional()
  @IsString()
  moduleId?: string;
}
