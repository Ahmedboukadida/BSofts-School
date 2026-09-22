import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDynamicEnumDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  establishmentId?: string;

  @ApiProperty({ example: 'PAYMENT_METHOD' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'VIREMENT_BANCAIRE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Virement Bancaire' })
  @IsString()
  @IsNotEmpty()
  labelFr: string;

  @ApiProperty({ example: 'Bank Transfer' })
  @IsString()
  @IsNotEmpty()
  labelEn: string;

  @ApiProperty({ example: 'تحويل بنكي' })
  @IsString()
  @IsNotEmpty()
  labelAr: string;

  @ApiPropertyOptional({ example: '#4F46E5' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateDynamicEnumDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  labelFr?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  labelEn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  labelAr?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryDynamicEnumDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  establishmentId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
