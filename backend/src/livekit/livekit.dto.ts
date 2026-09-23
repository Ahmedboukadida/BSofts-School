import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LiveKitConfigDto {
  @ApiProperty({ description: 'LiveKit Cloud URL', example: 'wss://bsofts-yid6ey9o.livekit.cloud' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'LiveKit API Key', example: 'APIusw2GoZsh792' })
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'LiveKit API Secret' })
  @IsString()
  apiSecret: string;

  @ApiPropertyOptional({ description: 'Token TTL in minutes', default: 240 })
  @IsOptional()
  @IsNumber()
  tokenTtlMinutes?: number;
}

export class GenerateLiveKitTokenDto {
  @ApiProperty({ description: 'Room name', example: 'meeting-123' })
  @IsString()
  roomName: string;

  @ApiProperty({ description: 'Participant identity/UUID', example: 'user-456' })
  @IsString()
  participantIdentity: string;

  @ApiPropertyOptional({ description: 'Participant display name', example: 'M. Moncef' })
  @IsOptional()
  @IsString()
  participantName?: string;
}
