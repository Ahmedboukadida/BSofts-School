import { ApiProperty } from '@nestjs/swagger';

export class EmployeeContractEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty({ required: false })
  employee?: Record<string, unknown>;

  @ApiProperty()
  type: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ required: false, nullable: true })
  endDate?: Date | null;

  @ApiProperty()
  salary: number | string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<EmployeeContractEntity>) {
    Object.assign(this, partial);
  }
}
