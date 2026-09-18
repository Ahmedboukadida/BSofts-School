import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class SmtpConfigEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty()
  host: string;

  @ApiProperty()
  port: number;

  @ApiProperty()
  user: string;

  @Exclude()
  password?: string;

  @ApiProperty()
  fromName: string;

  @ApiProperty()
  fromEmail: string;

  @ApiProperty()
  isSecure: boolean;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<SmtpConfigEntity>) {
    Object.assign(this, partial);
  }
}

export class MailSendResultEntity {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  messageId?: string;

  @ApiProperty({ required: false })
  error?: string;

  constructor(partial: Partial<MailSendResultEntity>) {
    Object.assign(this, partial);
  }
}
