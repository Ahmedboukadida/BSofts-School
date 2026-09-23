import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentAttendanceService } from './student-attendance.service';
import { MarkStudentAttendanceDto, BulkMarkAttendanceDto, QueryStudentAttendanceDto } from './student-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('student-attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentAttendanceController {
  constructor(private readonly service: StudentAttendanceService) {}

  @Get()
  @Permissions('attendance:list')
  @ApiOperation({ summary: 'List all student attendance records' })
  @ApiResponse({ status: 200, description: 'Student attendance records retrieved successfully' })
  findAll(@Query() query: QueryStudentAttendanceDto, @CurrentUser() user: any) {
    if (!query.establishmentId && !user?.isRoot && user?.establishmentId) {
      query.establishmentId = user.establishmentId;
    }
    return this.service.findAll(query);
  }

  @Get('stats/:studentId')
  @Permissions('attendance:read')
  @ApiOperation({ summary: 'Get attendance stats for a student' })
  @ApiResponse({ status: 200, description: 'Student attendance stats retrieved successfully' })
  getStats(@Param('studentId', ParseUUIDPipe) studentId: string, @Query('academicYearId') academicYearId?: string) {
    return this.service.getStats(studentId, academicYearId);
  }

  @Get(':id')
  @Permissions('attendance:read')
  @ApiOperation({ summary: 'Get a student attendance record by ID' })
  @ApiResponse({ status: 200, description: 'Student attendance record retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('attendance:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Mark student attendance' })
  @ApiResponse({ status: 201, description: 'Student attendance marked successfully' })
  mark(@Body() dto: MarkStudentAttendanceDto, @CurrentUser() user: any) {
    return this.service.mark(dto, undefined, user);
  }

  @Post('bulk')
  @Permissions('attendance:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Bulk mark student attendance' })
  @ApiResponse({ status: 201, description: 'Bulk attendance marked successfully' })
  bulkMark(@Body() dto: BulkMarkAttendanceDto, @CurrentUser() user: any) {
    return this.service.bulkMark(dto, user);
  }

  @Delete(':id')
  @Permissions('attendance:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete a student attendance record' })
  @ApiResponse({ status: 200, description: 'Student attendance record deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
