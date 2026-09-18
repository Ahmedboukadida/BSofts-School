import { ApiProperty } from '@nestjs/swagger';

export class RoomEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  code: string | null;

  @ApiProperty({ example: 30 })
  capacity: number;

  @ApiProperty({ example: 'CLASSROOM' })
  type: string;

  @ApiProperty({ required: false, nullable: true })
  building: string | null;

  @ApiProperty({ required: false, nullable: true })
  floor: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: {
    sessions: number;
  };

  constructor(partial: Partial<RoomEntity>) {
    Object.assign(this, partial);
  }
}
