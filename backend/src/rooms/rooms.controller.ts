import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, QueryRoomDto } from './room.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get()
  @Permissions('rooms:list')
  @ApiOperation({ summary: 'List all rooms' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  findAll(@Query() query: QueryRoomDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('rooms:read')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({ status: 200, description: 'Room retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('rooms:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  create(@Body() dto: CreateRoomDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('rooms:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoomDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/restore')
  @Permissions('rooms:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Restore a deactivated room' })
  @ApiResponse({ status: 200, description: 'Room restored successfully' })
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.service.restore(id, user);
  }

  @Delete(':id')
  @Permissions('rooms:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete a room (soft delete or permanent delete for root)' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
