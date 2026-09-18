import { ApiProperty } from '@nestjs/swagger';

export class LoginLogEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  user?: Record<string, unknown>;

  @ApiProperty({ required: false, nullable: true })
  ipAddress?: string | null;

  @ApiProperty({ required: false, nullable: true })
  userAgent?: string | null;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<LoginLogEntity>) {
    Object.assign(this, partial);
  }
}
