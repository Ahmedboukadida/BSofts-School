import { IsString, IsOptional, IsBoolean, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateMatiereItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  coefficient?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  maxScore?: number;
}

export class CreateAcademicModuleDto {
  @ApiProperty({ required: false, description: 'Establishment ID (auto-injected from JWT if omitted)' })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [CreateMatiereItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMatiereItemDto)
  matieres?: CreateMatiereItemDto[];
}

export class UpdateAcademicModuleDto {
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
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryAcademicModuleDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false, description: 'Include inactive/soft-deleted items' })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}
