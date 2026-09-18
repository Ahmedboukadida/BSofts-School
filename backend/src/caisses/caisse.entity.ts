import { ApiProperty } from '@nestjs/swagger';

export class CaisseEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: 'PHYSICAL' })
  type: string;

  @ApiProperty({ example: 0 })
  balance: number;

  @ApiProperty({ example: 'TND' })
  currency: string;

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
    transactions: number;
  };

  constructor(partial: Partial<CaisseEntity>) {
    Object.assign(this, partial);
  }
}
