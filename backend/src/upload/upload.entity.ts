import { ApiProperty } from '@nestjs/swagger';

export class UploadEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<UploadEntity>) {
    Object.assign(this, partial);
  }
}
