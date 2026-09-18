import { ApiProperty } from '@nestjs/swagger';

export class ExamEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty()
  classId: string;

  @ApiProperty({ required: false, nullable: true })
  periodId: string | null;

  @ApiProperty({ required: false, nullable: true })
  academicYearId: string | null;

  @ApiProperty({ required: false, nullable: true })
  matiereId: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  isOnline: boolean;

  @ApiProperty()
  maxScore: number;

  @ApiProperty({ required: false, nullable: true })
  duration: number | null;

  @ApiProperty({ required: false, nullable: true })
  startTime: Date | null;

  @ApiProperty({ required: false, nullable: true })
  endTime: Date | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  antiCheat: boolean;

  @ApiProperty()
  maxAttempts: number;

  @ApiProperty({ required: false, nullable: true })
  createdBy: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  class?: { id: string; name: string };

  @ApiProperty({ required: false })
  matiere?: { id: string; name: string };

  @ApiProperty({ required: false })
  period?: { id: string; name: string };

  @ApiProperty({ required: false })
  _count?: { questions: number; submissions: number };

  constructor(partial: Partial<ExamEntity>) {
    Object.assign(this, partial);
    if (partial.maxScore !== undefined && partial.maxScore !== null) {
      this.maxScore = Number(partial.maxScore);
    }
  }
}
