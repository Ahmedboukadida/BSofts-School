import { ApiProperty } from '@nestjs/swagger';

export class EstablishmentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ required: false })
  tenant?: Record<string, unknown>;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  category?: Record<string, unknown>;

  @ApiProperty()
  country: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty({ required: false, nullable: true })
  logo?: string | null;

  @ApiProperty({ required: false, nullable: true })
  address?: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  email?: string | null;

  @ApiProperty({ required: false, nullable: true })
  website?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  configs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  academicYears?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  classes?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  academicModules?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  rooms?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  holidays?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  smtpConfigs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  notificationConfigs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  paymentConfigs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  gradingConfigs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  students?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  teachers?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  employees?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  parents?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  paymentPlans?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  caisses?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  exams?: Record<string, unknown>[];

  @ApiProperty({ type: [String], required: false })
  userRoles?: string[];

  @ApiProperty({ required: false })
  profitLosses?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  graduationConfigs?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  dynamicEnums?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  _count?: Record<string, number>;

  constructor(partial: Partial<EstablishmentEntity>) {
    Object.assign(this, partial);
  }
}
