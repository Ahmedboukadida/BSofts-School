import { ApiProperty } from '@nestjs/swagger';

export class TenantSubscriptionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ required: false })
  tenant?: Record<string, unknown>;

  @ApiProperty()
  planId: string;

  @ApiProperty({ required: false })
  plan?: Record<string, unknown>;

  @ApiProperty()
  status: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ required: false, nullable: true })
  endDate?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<TenantSubscriptionEntity>) {
    Object.assign(this, partial);
  }
}
