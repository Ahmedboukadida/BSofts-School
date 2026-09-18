import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateSystemLogDto {
  @ApiProperty({ description: 'Log level: ERROR, WARN, FATAL, INFO' })
  @IsString()
  level: string;

  @ApiProperty({ description: 'Error message' })
  @IsString()
  message: string;

  @ApiProperty({ required: false, description: 'Stack trace' })
  @IsOptional()
  @IsString()
  stack?: string;

  @ApiProperty({ required: false, description: 'Context or module name' })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiProperty({ required: false, description: 'Request path' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ required: false, description: 'HTTP method' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiProperty({ required: false, description: 'HTTP status code' })
  @IsOptional()
  @IsInt()
  statusCode?: number;

  @ApiProperty({ required: false, description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, description: 'IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class QuerySystemLogDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Filter by log level' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false, description: 'Filter by context' })
  @IsOptional()
  @IsString()
  context?: string;
}
