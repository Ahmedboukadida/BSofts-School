import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty({ required: false })
  establishment?: Record<string, unknown>;

  @ApiProperty()
  name: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty()
  isClosed: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  periods?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  classes?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  studentClassAssignments?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  notes?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  exams?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  sessions?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  graduationRecords?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<AcademicYearEntity>) {
    Object.assign(this, partial);
  }
}
