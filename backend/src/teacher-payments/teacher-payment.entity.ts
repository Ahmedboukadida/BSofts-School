import { ApiProperty } from '@nestjs/swagger';

export class TeacherPaymentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ required: false })
  teacher?: Record<string, unknown>;

  @ApiProperty()
  contractId: string;

  @ApiProperty({ required: false })
  contract?: Record<string, unknown>;

  @ApiProperty()
  period: string;

  @ApiProperty()
  amount: number | string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ required: false, nullable: true })
  hoursWorked?: number | string | null;

  @ApiProperty()
  calculatedAmount: number | string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  paidAt?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;

  @ApiProperty({ required: false, nullable: true })
  createdBy?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<TeacherPaymentEntity>) {
    Object.assign(this, partial);
  }
}
