import { ApiProperty } from '@nestjs/swagger';

export class MessageEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  conversationId: string;

  @ApiProperty({ required: false })
  conversation?: Record<string, unknown>;

  @ApiProperty()
  senderId: string;

  @ApiProperty({ required: false })
  sender?: Record<string, unknown>;

  @ApiProperty({ required: false, nullable: true })
  receiverId?: string | null;

  @ApiProperty({ required: false })
  receiver?: Record<string, unknown>;

  @ApiProperty()
  content: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false, nullable: true })
  fileUrl?: string | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<MessageEntity>) {
    Object.assign(this, partial);
  }
}
