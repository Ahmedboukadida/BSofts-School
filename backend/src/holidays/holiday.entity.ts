import { ApiProperty } from '@nestjs/swagger';

export class HolidayEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isRecurring: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<HolidayEntity>) {
    Object.assign(this, partial);
  }
}
