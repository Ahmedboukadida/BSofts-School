import { ApiProperty } from '@nestjs/swagger';

export class UserRoleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  user?: Record<string, unknown>;

  @ApiProperty()
  roleId: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false, nullable: true })
  establishmentId?: string | null;

  @ApiProperty({ required: false })
  establishment?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<UserRoleEntity>) {
    Object.assign(this, partial);
  }
}
