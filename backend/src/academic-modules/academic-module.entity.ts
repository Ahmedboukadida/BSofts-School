import { ApiProperty } from '@nestjs/swagger';

export class AcademicModuleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  code: string | null;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: {
    matieres: number;
    classAssignments: number;
  };

  constructor(partial: Partial<AcademicModuleEntity>) {
    Object.assign(this, partial);
  }
}
