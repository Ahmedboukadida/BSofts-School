import { ApiProperty } from '@nestjs/swagger';

export class TeacherContractEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ required: false })
  teacher?: Record<string, unknown>;

  @ApiProperty()
  contractType: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ required: false, nullable: true })
  endDate?: Date | null;

  @ApiProperty()
  salary: number | string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ required: false, nullable: true })
  hourlyRate?: number | string | null;

  @ApiProperty({ required: false, nullable: true })
  monthlyHours?: number | null;

  @ApiProperty({ required: false, nullable: true })
  paymentFormula?: Record<string, unknown> | unknown[] | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  payments?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<TeacherContractEntity>) {
    Object.assign(this, partial);
  }
}
