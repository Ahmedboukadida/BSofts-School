import { ApiProperty } from '@nestjs/swagger';

export class RoleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  isSystem: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [String], required: false })
  permissions?: string[];

  @ApiProperty({ type: [String], required: false })
  userRoles?: string[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<RoleEntity>) {
    Object.assign(this, partial);
  }
}
