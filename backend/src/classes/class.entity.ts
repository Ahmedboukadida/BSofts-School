import { ApiProperty } from '@nestjs/swagger';

export class ClassEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty()
  classLevelId: string;

  @ApiProperty()
  academicYearId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  code: string | null;

  @ApiProperty()
  periodType: string;

  @ApiProperty({ required: false, nullable: true })
  maxStudents: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false, nullable: true })
  gradingConfigId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  classLevel?: { id: string; name: string };

  @ApiProperty({ required: false })
  academicYear?: { id: string; name: string };

  @ApiProperty({ required: false })
  _count?: {
    studentClassAssignments: number;
    sessions: number;
  };

  constructor(partial: Partial<ClassEntity>) {
    Object.assign(this, partial);
  }
}
