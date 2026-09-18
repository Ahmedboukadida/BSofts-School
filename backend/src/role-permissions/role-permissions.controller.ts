import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolePermissionsService } from './role-permissions.service';
import { AssignPermissionDto } from './role-permission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('role-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  @Permissions('roles:assign_permission')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiResponse({ status: 201, description: 'Permission assigned successfully' })
  assign(@Body() dto: AssignPermissionDto) {
    return this.rolePermissionsService.assign(dto);
  }

  @Get('role/:roleId')
  @Permissions('roles:read')
  @ApiOperation({ summary: 'Get permissions by role ID' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully' })
  findByRole(@Param('roleId', ParseUUIDPipe) roleId: string) {
    return this.rolePermissionsService.findByRole(roleId);
  }

  @Delete(':roleId/:permissionId')
  @Permissions('roles:remove_permission')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  remove(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.rolePermissionsService.remove(roleId, permissionId);
  }
}
