import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class CreateConversationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ enum: ['DIRECT', 'GROUP', 'ANNOUNCEMENT'] })
  @IsEnum(['DIRECT', 'GROUP', 'ANNOUNCEMENT'])
  type: string;

  @ApiProperty()
  participantIds: string[];
}

export class QueryConversationDto extends PaginationQueryDto {
  @ApiProperty({ required: false, enum: ['DIRECT', 'GROUP', 'ANNOUNCEMENT'] })
  @IsOptional()
  @IsEnum(['DIRECT', 'GROUP', 'ANNOUNCEMENT'])
  type?: string;
}
