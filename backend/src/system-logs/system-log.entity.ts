import { ApiProperty } from '@nestjs/swagger';

export class SystemLogEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'ERROR' })
  level: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false, nullable: true })
  stack: string | null;

  @ApiProperty({ required: false, nullable: true })
  context: string | null;

  @ApiProperty({ required: false, nullable: true })
  path: string | null;

  @ApiProperty({ required: false, nullable: true })
  method: string | null;

  @ApiProperty({ required: false, nullable: true })
  statusCode: number | null;

  @ApiProperty({ required: false, nullable: true })
  userId: string | null;

  @ApiProperty({ required: false, nullable: true })
  ipAddress: string | null;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<SystemLogEntity>) {
    Object.assign(this, partial);
  }
}
