import { ApiProperty } from '@nestjs/swagger';

export class SessionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  classId: string;

  @ApiProperty({ required: false })
  class?: Record<string, unknown>;

  @ApiProperty({ required: false, nullable: true })
  scheduleId?: string | null;

  @ApiProperty({ required: false })
  schedule?: Record<string, unknown>;

  @ApiProperty()
  periodId: string;

  @ApiProperty({ required: false })
  period?: Record<string, unknown>;

  @ApiProperty()
  academicYearId: string;

  @ApiProperty({ required: false })
  academicYear?: Record<string, unknown>;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty({ required: false, nullable: true })
  topic?: string | null;

  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  teacherId?: string | null;

  @ApiProperty({ required: false })
  teacher?: Record<string, unknown>;

  @ApiProperty({ required: false, nullable: true })
  roomId?: string | null;

  @ApiProperty({ required: false })
  room?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  attendances?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  lessons?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<SessionEntity>) {
    Object.assign(this, partial);
  }
}
