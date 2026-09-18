import { ApiProperty } from '@nestjs/swagger';

export class PaymentPlanEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty({ required: false })
  establishment?: Record<string, unknown>;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ required: false, nullable: true })
  classLevelId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  classId?: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number | string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ required: false, nullable: true })
  dueDate?: Date | null;

  @ApiProperty({ required: false })
  recurringPeriod?: Record<string, unknown>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false, nullable: true })
  startDate?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  endDate?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  payments?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<PaymentPlanEntity>) {
    Object.assign(this, partial);
  }
}
