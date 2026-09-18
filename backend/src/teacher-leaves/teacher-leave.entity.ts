import { ApiProperty } from '@nestjs/swagger';

export class TeacherLeaveEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ required: false })
  teacher?: Record<string, unknown>;

  @ApiProperty()
  type: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ required: false, nullable: true })
  reason?: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  approvedBy?: string | null;

  @ApiProperty({ required: false, nullable: true })
  approvedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<TeacherLeaveEntity>) {
    Object.assign(this, partial);
  }
}
