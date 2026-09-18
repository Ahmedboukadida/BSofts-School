import { ApiProperty } from '@nestjs/swagger';

export class NoteEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ required: false })
  student?: Record<string, unknown>;

  @ApiProperty()
  matiereId: string;

  @ApiProperty({ required: false })
  matiere?: Record<string, unknown>;

  @ApiProperty()
  periodId: string;

  @ApiProperty({ required: false })
  period?: Record<string, unknown>;

  @ApiProperty()
  academicYearId: string;

  @ApiProperty({ required: false })
  academicYear?: Record<string, unknown>;

  @ApiProperty({ required: false, nullable: true })
  examId?: string | null;

  @ApiProperty({ required: false })
  exam?: Record<string, unknown>;

  @ApiProperty()
  value: number | string;

  @ApiProperty()
  maxValue: number | string;

  @ApiProperty()
  coefficient: number | string;

  @ApiProperty({ required: false, nullable: true })
  comment?: string | null;

  @ApiProperty({ required: false, nullable: true })
  gradedBy?: string | null;

  @ApiProperty()
  gradedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<NoteEntity>) {
    Object.assign(this, partial);
  }
}
