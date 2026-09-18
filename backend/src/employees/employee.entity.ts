import { ApiProperty } from '@nestjs/swagger';

export class EmployeeEntity {
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

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false, nullable: true })
  department: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ required: false, nullable: true })
  email: string | null;

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
    baseSalary: any;
  }>;

  constructor(partial: Partial<EmployeeEntity>) {
    Object.assign(this, partial);
  }
}
