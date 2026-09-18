import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Role ID' })
  @IsString()
  roleId: string;

  @ApiProperty({ required: false, description: 'Establishment ID' })
  @IsOptional()
  @IsString()
  establishmentId?: string;
}

export class RemoveRoleDto {
  @ApiProperty({ description: 'User role ID' })
  @IsString()
  userRoleId: string;
}
