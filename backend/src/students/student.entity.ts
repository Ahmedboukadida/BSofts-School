import { ApiProperty } from '@nestjs/swagger';

export class StudentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty({ required: false, nullable: true })
  userId: string | null;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false, nullable: true })
  dateOfBirth: Date | null;

  @ApiProperty({ required: false, nullable: true })
  gender: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ required: false, nullable: true })
  address: string | null;

  @ApiProperty({ required: false, nullable: true })
  photo: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  classAssignments?: Array<{
    id: string;
    class: { id: string; name: string };
  }>;

  @ApiProperty({ required: false })
  parents?: Array<{
    parent: { id: string; firstName: string; lastName: string; phone: string | null };
  }>;

  constructor(partial: Partial<StudentEntity>) {
    Object.assign(this, partial);
  }
}
