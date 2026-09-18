import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { MarkTeacherAttendanceDto, QueryTeacherAttendanceDto } from './teacher-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('teacher-attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherAttendanceController {
  constructor(private readonly service: TeacherAttendanceService) {}

  @Get()
  @Permissions('attendance:list')
  @ApiOperation({ summary: 'List all teacher attendance records' })
  @ApiResponse({ status: 200, description: 'Teacher attendance records retrieved successfully' })
  findAll(@Query() query: QueryTeacherAttendanceDto) {
    return this.service.findAll(query);
  }

  @Get('stats/:teacherId')
  @Permissions('attendance:read')
  @ApiOperation({ summary: 'Get attendance stats for a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher attendance stats retrieved successfully' })
  getStats(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getStats(teacherId, startDate, endDate);
  }

  @Post()
  @Permissions('attendance:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Mark teacher attendance' })
  @ApiResponse({ status: 201, description: 'Teacher attendance marked successfully' })
  mark(@Body() dto: MarkTeacherAttendanceDto, @CurrentUser() user: any) {
    return this.service.mark(dto, user);
  }

  @Delete(':id')
  @Permissions('attendance:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete a teacher attendance record' })
  @ApiResponse({ status: 200, description: 'Teacher attendance record deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
