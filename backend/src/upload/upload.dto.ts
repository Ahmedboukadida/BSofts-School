import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadQueryDto {
  @ApiProperty({ required: false, description: 'Folder sub-directory (e.g. avatars, documents, exams)' })
  @IsOptional()
  @IsString()
  folder?: string;
}
