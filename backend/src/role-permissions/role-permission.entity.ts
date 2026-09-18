import { ApiProperty } from '@nestjs/swagger';

export class RolePermissionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  permissionId: string;

  @ApiProperty({ required: false })
  permission?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<RolePermissionEntity>) {
    Object.assign(this, partial);
  }
}
