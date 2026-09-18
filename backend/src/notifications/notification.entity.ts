import { ApiProperty } from '@nestjs/swagger';

export class NotificationEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  user?: Record<string, unknown>;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ required: false, nullable: true })
  link?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<NotificationEntity>) {
    Object.assign(this, partial);
  }
}
