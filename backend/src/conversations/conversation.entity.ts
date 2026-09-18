import { ApiProperty } from '@nestjs/swagger';

export class ConversationEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  title?: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  participants?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  messages?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<ConversationEntity>) {
    Object.assign(this, partial);
  }
}
