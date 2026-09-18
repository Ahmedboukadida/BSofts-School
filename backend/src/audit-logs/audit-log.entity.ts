import { ApiProperty } from '@nestjs/swagger';

export class AuditLogEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  userId: string | null;

  @ApiProperty({ required: false, nullable: true, description: 'Composed snapshot: FirstName LastName (@handle) [ROLE]' })
  actorSnapshot: string | null;

  @ApiProperty()
  action: string;

  @ApiProperty()
  entity: string;

  @ApiProperty({ required: false, nullable: true })
  entityId: string | null;

  @ApiProperty({ example: 'SUCCESS' })
  status: string;

  @ApiProperty({ required: false, nullable: true })
  oldValues: any;

  @ApiProperty({ required: false, nullable: true })
  newValues: any;

  @ApiProperty({ required: false, nullable: true })
  ipAddress: string | null;

  @ApiProperty({ required: false, nullable: true })
  userAgent: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false, nullable: true })
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;

  constructor(partial: Partial<AuditLogEntity>) {
    Object.assign(this, partial);
  }
}
