import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherLeavesService } from './teacher-leaves.service';
import { CreateTeacherLeaveDto, UpdateLeaveStatusDto, QueryTeacherLeaveDto } from './teacher-leave.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Teachers')
@ApiBearerAuth()
@Controller('teacher-leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherLeavesController {
  constructor(private readonly service: TeacherLeavesService) {}

  @Get()
  @Permissions('attendance:list')
  @ApiOperation({ summary: 'List all teacher leaves' })
  @ApiResponse({ status: 200, description: 'Teacher leaves retrieved successfully' })
  findAll(@Query() query: QueryTeacherLeaveDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('attendance:read')
  @ApiOperation({ summary: 'Get a teacher leave by ID' })
  @ApiResponse({ status: 200, description: 'Teacher leave retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('attendance:create')
  @ApiOperation({ summary: 'Create a new teacher leave' })
  @ApiResponse({ status: 201, description: 'Teacher leave created successfully' })
  create(@Body() dto: CreateTeacherLeaveDto) {
    return this.service.create(dto);
  }

  @Put(':id/status')
  @Permissions('attendance:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update teacher leave status' })
  @ApiResponse({ status: 200, description: 'Leave status updated successfully' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @Permissions('attendance:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a teacher leave' })
  @ApiResponse({ status: 200, description: 'Teacher leave deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
