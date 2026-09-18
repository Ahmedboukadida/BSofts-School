import { ApiProperty } from '@nestjs/swagger';

export class SaaSModuleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  plans?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  permissions?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<SaaSModuleEntity>) {
    Object.assign(this, partial);
  }
}
