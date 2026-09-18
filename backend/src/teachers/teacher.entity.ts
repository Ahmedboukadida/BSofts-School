import { ApiProperty } from '@nestjs/swagger';

export class TeacherEntity {
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
  specialty: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    email: string | null;
    username: string | null;
  } | null;

  @ApiProperty({ required: false })
  contracts?: Array<{
    id: string;
    contractType: string;
    hourlyRate: any;
    baseSalary: any;
  }>;

  @ApiProperty({ required: false })
  matieres?: Array<{
    matiere: { id: string; name: string };
  }>;

  constructor(partial: Partial<TeacherEntity>) {
    Object.assign(this, partial);
  }
}
