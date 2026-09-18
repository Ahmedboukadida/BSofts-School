import { ApiProperty } from '@nestjs/swagger';

export class BulletinEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ required: false })
  student?: Record<string, unknown>;

  @ApiProperty()
  periodId: string;

  @ApiProperty({ required: false })
  period?: Record<string, unknown>;

  @ApiProperty()
  classId: string;

  @ApiProperty({ required: false })
  class?: Record<string, unknown>;

  @ApiProperty()
  totalScore: number | string;

  @ApiProperty()
  averageScore: number | string;

  @ApiProperty({ required: false, nullable: true })
  rank?: number | null;

  @ApiProperty({ required: false, nullable: true })
  isPromoted?: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  comments?: string | null;

  @ApiProperty()
  generatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  generatedBy?: string | null;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<BulletinEntity>) {
    Object.assign(this, partial);
  }
}
