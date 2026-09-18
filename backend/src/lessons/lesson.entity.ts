import { ApiProperty } from '@nestjs/swagger';

export class LessonEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({ required: false })
  session?: Record<string, unknown>;

  @ApiProperty()
  matiereId: string;

  @ApiProperty({ required: false })
  matiere?: Record<string, unknown>;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  content?: string | null;

  @ApiProperty({ required: false, nullable: true })
  objectives?: string | null;

  @ApiProperty({ required: false, nullable: true })
  resources?: Record<string, unknown> | unknown[] | null;

  @ApiProperty({ required: false, nullable: true })
  createdBy?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<LessonEntity>) {
    Object.assign(this, partial);
  }
}
