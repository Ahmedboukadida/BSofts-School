import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'SYSTEM'] })
  @IsEnum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'SYSTEM'])
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  link?: string;
}

export class QueryNotificationDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ required: false, enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'SYSTEM'] })
  @IsOptional()
  @IsEnum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'SYSTEM'])
  type?: string;
}
