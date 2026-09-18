import { ApiProperty } from '@nestjs/swagger';

export class AcademicPeriodEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  academicYearId: string;

  @ApiProperty({ required: false })
  academicYear?: Record<string, unknown>;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  notes?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  exams?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  sessions?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  classSchedules?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  bulletins?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<AcademicPeriodEntity>) {
    Object.assign(this, partial);
  }
}
