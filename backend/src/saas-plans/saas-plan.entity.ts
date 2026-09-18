import { ApiProperty } from '@nestjs/swagger';

export class SaaSPlanEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  price: number | string;

  @ApiProperty({ required: false })
  currency?: Record<string, unknown>;

  @ApiProperty({ required: false })
  interval?: Record<string, unknown>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  modules?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  features?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  subscriptions?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<SaaSPlanEntity>) {
    Object.assign(this, partial);
  }
}
