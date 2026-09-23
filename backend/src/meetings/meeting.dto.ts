import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export class MeetingParticipantInputDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ required: false, enum: ['HOST', 'MODERATOR', 'PRESENTER', 'ATTENDEE'] })
  @IsOptional()
  @IsEnum(['HOST', 'MODERATOR', 'PRESENTER', 'ATTENDEE'])
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class MeetingPointInputDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVote?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class MeetingDocumentInputDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  fileUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sizeBytes?: number;
}

export class CreateMeetingDto {
  @ApiProperty({ description: 'Subject or title of the meeting' })
  @IsString()
  subject: string;

  @ApiProperty({ required: false, enum: ['GENERAL', 'PARENT_TEACHER', 'STAFF', 'DISCIPLINE', 'PEDAGOGICAL', 'BOARD'] })
  @IsOptional()
  @IsEnum(['GENERAL', 'PARENT_TEACHER', 'STAFF', 'DISCIPLINE', 'PEDAGOGICAL', 'BOARD'])
  type?: string;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Start time (HH:MM)' })
  @IsString()
  startTime: string;

  @ApiProperty({ required: false, description: 'End time (HH:MM)' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false, default: 60 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false, enum: ['IN_PERSON', 'ONLINE', 'HYBRID'] })
  @IsOptional()
  @IsEnum(['IN_PERSON', 'ONLINE', 'HYBRID'])
  mode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false, type: [MeetingParticipantInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingParticipantInputDto)
  participants?: MeetingParticipantInputDto[];

  @ApiProperty({ required: false, type: [MeetingPointInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingPointInputDto)
  points?: MeetingPointInputDto[];

  @ApiProperty({ required: false, type: [MeetingDocumentInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingDocumentInputDto)
  documents?: MeetingDocumentInputDto[];
}

export class UpdateMeetingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false, enum: ['GENERAL', 'PARENT_TEACHER', 'STAFF', 'DISCIPLINE', 'PEDAGOGICAL', 'BOARD'] })
  @IsOptional()
  @IsEnum(['GENERAL', 'PARENT_TEACHER', 'STAFF', 'DISCIPLINE', 'PEDAGOGICAL', 'BOARD'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false, enum: ['IN_PERSON', 'ONLINE', 'HYBRID'] })
  @IsOptional()
  @IsEnum(['IN_PERSON', 'ONLINE', 'HYBRID'])
  mode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  summary?: string;
}

export class QueryMeetingDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiProperty({ required: false, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiProperty({ required: false, enum: ['GENERAL', 'PARENT_TEACHER', 'STAFF', 'DISCIPLINE', 'PEDAGOGICAL', 'BOARD'] })
  @IsOptional()
  @IsEnum(['GENERAL', 'PARENT_TEACHER', 'STAFF', 'DISCIPLINE', 'PEDAGOGICAL', 'BOARD'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class JoinMeetingDto {
  @ApiProperty({ required: false, description: 'One-click participant invite token' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ required: false, description: 'Display name for guest' })
  @IsOptional()
  @IsString()
  guestName?: string;
}

export class VoteMeetingPointDto {
  @ApiProperty()
  @IsString()
  participantId: string;

  @ApiProperty({ enum: ['YES', 'NO', 'ABSTAIN'] })
  @IsEnum(['YES', 'NO', 'ABSTAIN'])
  value: 'YES' | 'NO' | 'ABSTAIN';
}

export class HandRaiseDto {
  @ApiProperty()
  @IsString()
  participantId: string;

  @ApiProperty()
  @IsBoolean()
  handRaised: boolean;
}
