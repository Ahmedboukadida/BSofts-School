import { ApiProperty } from '@nestjs/swagger';

export class TeacherAttendanceEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ required: false, nullable: true })
  checkIn: Date | null;

  @ApiProperty({ required: false, nullable: true })
  checkOut: Date | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  source: string;

  @ApiProperty({ required: false, nullable: true })
  markedBy: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  teacher?: { id: string; firstName: string; lastName: string };

  constructor(partial: Partial<TeacherAttendanceEntity>) {
    Object.assign(this, partial);
  }
}
