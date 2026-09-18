import { ApiProperty } from '@nestjs/swagger';

export class FinancialTransactionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  caisseId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ required: false, nullable: true })
  balance: number | null;

  @ApiProperty({ required: false, nullable: true })
  category: string | null;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ required: false, nullable: true })
  referenceId: string | null;

  @ApiProperty({ required: false, nullable: true })
  referenceType: string | null;

  @ApiProperty({ required: false, nullable: true })
  performedBy: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  caisse?: { id: string; name: string };

  constructor(partial: Partial<FinancialTransactionEntity>) {
    Object.assign(this, partial);
    if (partial.amount !== undefined && partial.amount !== null) {
      this.amount = Number(partial.amount);
    }
    if (partial.balance !== undefined && partial.balance !== null) {
      this.balance = Number(partial.balance);
    }
  }
}
