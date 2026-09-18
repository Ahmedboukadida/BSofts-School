import { ApiProperty } from '@nestjs/swagger';

export class StudentPaymentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ required: false, nullable: true })
  parentId: string | null;

  @ApiProperty({ required: false, nullable: true })
  planId: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty({ default: 'TND' })
  currency: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  dueDate: Date | null;

  @ApiProperty({ required: false, nullable: true })
  paidAt: Date | null;

  @ApiProperty({ required: false, nullable: true })
  reference: string | null;

  @ApiProperty({ required: false, nullable: true })
  stripePaymentId: string | null;

  @ApiProperty({ required: false, nullable: true })
  paypalPaymentId: string | null;

  @ApiProperty({ required: false, nullable: true })
  checkNumber: string | null;

  @ApiProperty({ required: false, nullable: true })
  notes: string | null;

  @ApiProperty({ required: false, nullable: true })
  penaltyAmount: number | null;

  @ApiProperty({ required: false, nullable: true })
  createdBy: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  student?: { id: string; firstName: string; lastName: string; registrationNumber?: string | null };

  @ApiProperty({ required: false })
  parent?: { id: string; firstName: string; lastName: string } | null;

  @ApiProperty({ required: false })
  plan?: { id: string; name: string } | null;

  constructor(partial: Partial<StudentPaymentEntity>) {
    Object.assign(this, partial);
    if (partial.amount !== undefined && partial.amount !== null) {
      this.amount = Number(partial.amount);
    }
    if (partial.penaltyAmount !== undefined && partial.penaltyAmount !== null) {
      this.penaltyAmount = Number(partial.penaltyAmount);
    }
  }
}
