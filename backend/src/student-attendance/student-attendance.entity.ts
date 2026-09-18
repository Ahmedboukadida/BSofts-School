import { ApiProperty } from '@nestjs/swagger';

export class StudentAttendanceEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  reason: string | null;

  @ApiProperty({ required: false, nullable: true })
  markedBy: string | null;

  @ApiProperty()
  markedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  student?: { id: string; firstName: string; lastName: string; registrationNumber?: string | null };

  @ApiProperty({ required: false })
  session?: { id: string; date: Date; topic?: string | null; class?: { id: string; name: string } };

  constructor(partial: Partial<StudentAttendanceEntity>) {
    Object.assign(this, partial);
  }
}
