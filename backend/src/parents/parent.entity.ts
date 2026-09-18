import { ApiProperty } from '@nestjs/swagger';

export class ParentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty({ required: false, nullable: true })
  userId: string | null;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false, nullable: true })
  cin: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ required: false, nullable: true })
  profession: string | null;

  @ApiProperty({ required: false, nullable: true })
  address: string | null;

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
  students?: Array<{
    id: string;
    relationship: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      registrationNumber: string;
    };
  }>;

  constructor(partial: Partial<ParentEntity>) {
    Object.assign(this, partial);
  }
}
