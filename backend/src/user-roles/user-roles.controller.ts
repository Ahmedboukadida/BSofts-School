import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { AssignRoleDto } from './user-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user-roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @Permissions('users:assign_role')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  assign(@Body() dto: AssignRoleDto) {
    return this.userRolesService.assign(dto);
  }

  @Get('user/:userId')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get roles by user ID' })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userRolesService.findByUser(userId);
  }

  @Get('establishment/:establishmentId')
  @Permissions('users:list')
  @ApiOperation({ summary: 'Get roles by establishment ID' })
  @ApiResponse({ status: 200, description: 'Establishment user roles retrieved successfully' })
  findByEstablishment(@Param('establishmentId', ParseUUIDPipe) establishmentId: string) {
    return this.userRolesService.findByEstablishment(establishmentId);
  }

  @Delete(':id')
  @Permissions('users:remove_role')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRolesService.remove(id);
  }
}
