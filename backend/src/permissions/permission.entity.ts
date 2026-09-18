import { ApiProperty } from '@nestjs/swagger';

export class PermissionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  moduleId: string;

  @ApiProperty({ required: false })
  module?: Record<string, unknown>;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [String], required: false })
  rolePermissions?: string[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<PermissionEntity>) {
    Object.assign(this, partial);
  }
}
