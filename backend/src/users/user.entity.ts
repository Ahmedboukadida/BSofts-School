import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  email?: string | null;

  @ApiProperty({ required: false, nullable: true })
  username?: string | null;

  @ApiProperty()
  password: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatar?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isRoot: boolean;

  @ApiProperty({ required: false, nullable: true })
  lastLoginAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  tenant?: Record<string, unknown>;

  @ApiProperty({ type: [String], required: false })
  userRoles?: string[];

  @ApiProperty({ required: false })
  auditLogs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  loginLogs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  sentMessages?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  receivedMessages?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  notifications?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  student?: Record<string, unknown>;

  @ApiProperty({ required: false })
  parent?: Record<string, unknown>;

  @ApiProperty({ required: false })
  teacher?: Record<string, unknown>;

  @ApiProperty({ required: false })
  employee?: Record<string, unknown>;

  @ApiProperty({ required: false })
  conversationParticipants?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
