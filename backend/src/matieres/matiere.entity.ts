import { ApiProperty } from '@nestjs/swagger';

export class MatiereEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  moduleId: string;

  @ApiProperty({ required: false })
  module?: Record<string, unknown>;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  code?: string | null;

  @ApiProperty()
  coefficient: number | string;

  @ApiProperty()
  maxScore: number | string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  lessons?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  notes?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  exams?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  teacherMatieres?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  classSchedules?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<MatiereEntity>) {
    Object.assign(this, partial);
  }
}
