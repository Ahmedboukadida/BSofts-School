import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  conversationId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false, enum: ['TEXT', 'IMAGE', 'FILE', 'AUDIO'] })
  @IsOptional()
  @IsEnum(['TEXT', 'IMAGE', 'FILE', 'AUDIO'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiverId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class QueryMessageDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
