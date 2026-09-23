import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, MinLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateRoomDto {
  @ApiProperty({ required: false })
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

  @ApiProperty({ enum: ['CLASSROOM', 'LABORATORY', 'LIBRARY', 'GYM', 'AUDITORIUM', 'COMPUTER_LAB', 'ART_ROOM', 'MUSIC_ROOM', 'OTHER'] })
  @IsEnum(['CLASSROOM', 'LABORATORY', 'LIBRARY', 'GYM', 'AUDITORIUM', 'COMPUTER_LAB', 'ART_ROOM', 'MUSIC_ROOM', 'OTHER'])
  type: string;

  @ApiProperty()
  @IsNumber()
  capacity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  equipment?: string[];
}

export class UpdateRoomDto {
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
  @IsNumber()
  capacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  equipment?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryRoomDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false, enum: ['CLASSROOM', 'LABORATORY', 'LIBRARY', 'GYM', 'AUDITORIUM', 'COMPUTER_LAB', 'ART_ROOM', 'MUSIC_ROOM', 'OTHER'] })
  @IsOptional()
  @IsEnum(['CLASSROOM', 'LABORATORY', 'LIBRARY', 'GYM', 'AUDITORIUM', 'COMPUTER_LAB', 'ART_ROOM', 'MUSIC_ROOM', 'OTHER'])
  type?: string;

  @ApiProperty({ required: false, description: 'Include inactive/soft-deleted items' })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}
