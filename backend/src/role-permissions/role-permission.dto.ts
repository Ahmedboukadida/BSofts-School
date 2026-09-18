import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsString()
  roleId: string;

  @ApiProperty({ description: 'Permission IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}

export class RemovePermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsString()
  roleId: string;

  @ApiProperty({ description: 'Permission ID' })
  @IsString()
  permissionId: string;
}
