import { ApiProperty } from '@nestjs/swagger';

export class TenantEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  user?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  settings?: Record<string, unknown>;

  @ApiProperty({ required: false })
  establishments?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  subscriptions?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  planFeatureOverrides?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<TenantEntity>) {
    Object.assign(this, partial);
  }
}
