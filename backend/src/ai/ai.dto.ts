import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatMessageItemDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty({ description: 'Message body' })
  @IsString()
  content: string;
}

export class AiChatDto {
  @ApiProperty({ description: 'Prompt sent by user', example: 'Quels sont les examens prévus cette semaine ?' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Chat message history', type: [ChatMessageItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageItemDto)
  history?: ChatMessageItemDto[];

  @ApiPropertyOptional({ description: 'Establishment context ID' })
  @IsOptional()
  @IsUUID()
  establishmentId?: string;
}

export class AiGenerateExamDto {
  @ApiProperty({ description: 'Exam subject topic or chapter', example: 'Les fonctions exponentielles et logarithmes' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: 'Subject/Matière name', example: 'Mathématiques' })
  @IsOptional()
  @IsString()
  matiereName?: string;

  @ApiPropertyOptional({ description: 'Class level or group name', example: '4ème Année Secondaire' })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiPropertyOptional({ description: 'Subject ID' })
  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @ApiPropertyOptional({ description: 'Class ID' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Number of questions to generate', example: 5, default: 5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  questionCount?: number;

  @ApiPropertyOptional({ description: 'Difficulty level', enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' })
  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @ApiPropertyOptional({ description: 'Exam format', enum: ['QCM', 'MIXED', 'OPEN'], default: 'MIXED' })
  @IsOptional()
  @IsIn(['QCM', 'MIXED', 'OPEN'])
  type?: 'QCM' | 'MIXED' | 'OPEN';

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 60 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({ description: 'Target establishment ID' })
  @IsOptional()
  @IsUUID()
  establishmentId?: string;
}

export class AiGenerateBulletinRemarksDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  studentId: string;

  @ApiPropertyOptional({ description: 'Academic period ID' })
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @ApiPropertyOptional({ description: 'Student average score on 20', example: 14.5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  averageScore?: number;

  @ApiPropertyOptional({ description: 'Student conduct/behavior', example: 'Très sérieux et attentif' })
  @IsOptional()
  @IsString()
  conduct?: string;

  @ApiPropertyOptional({ description: 'Subject strengths', example: 'Sciences et Mathématiques' })
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional({ description: 'Areas for improvement', example: 'Participation orale en langues' })
  @IsOptional()
  @IsString()
  areasForImprovement?: string;

  @ApiPropertyOptional({ description: 'Output language', enum: ['FR', 'EN', 'AR'], default: 'FR' })
  @IsOptional()
  @IsIn(['FR', 'EN', 'AR'])
  language?: 'FR' | 'EN' | 'AR';
}

export class AiGenerateHomeworkDto {
  @ApiProperty({ description: 'Homework topic or learning objective', example: 'Exercices sur le théorème de Thalès' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: 'Class Name', example: '3ème Collège' })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiPropertyOptional({ description: 'Matière Name', example: 'Mathématiques' })
  @IsOptional()
  @IsString()
  matiereName?: string;

  @ApiPropertyOptional({ description: 'Class ID' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Matiere ID' })
  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @ApiPropertyOptional({ description: 'Pedagogical instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Due date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Establishment ID' })
  @IsOptional()
  @IsUUID()
  establishmentId?: string;
}

export class AiToggleTenantDto {
  @ApiProperty({ description: 'Enable or disable AI feature for this tenant', example: true })
  @IsBoolean()
  isEnabled: boolean;
}

export class AiPlatformConfigDto {
  @ApiPropertyOptional({ description: 'Default AI provider', enum: ['GEMINI', 'GROQ', 'OPENROUTER'] })
  @IsOptional()
  @IsIn(['GEMINI', 'GROQ', 'OPENROUTER'])
  provider?: 'GEMINI' | 'GROQ' | 'OPENROUTER';

  @ApiPropertyOptional({ description: 'Default AI model name', example: 'gemini-2.5-flash' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Google AI Studio (Gemini) API Key' })
  @IsOptional()
  @IsString()
  geminiApiKey?: string;

  @ApiPropertyOptional({ description: 'Groq API Key' })
  @IsOptional()
  @IsString()
  groqApiKey?: string;

  @ApiPropertyOptional({ description: 'OpenRouter API Key' })
  @IsOptional()
  @IsString()
  openrouterApiKey?: string;
}
