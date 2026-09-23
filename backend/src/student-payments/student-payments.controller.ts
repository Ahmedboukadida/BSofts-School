import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentPaymentsService } from './student-payments.service';
import { CreateStudentPaymentDto, UpdatePaymentStatusDto, UpdateStudentPaymentDto, QueryStudentPaymentDto } from './student-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('student-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentPaymentsController {
  constructor(private readonly service: StudentPaymentsService) {}

  @Get()
  @Permissions('payments:list')
  @ApiOperation({ summary: 'List all student payments' })
  @ApiResponse({ status: 200, description: 'Student payments retrieved successfully' })
  findAll(@Query() query: QueryStudentPaymentDto, @CurrentUser() user: any) {
    if (!query.establishmentId && !user?.isRoot && user?.establishmentId) {
      query.establishmentId = user.establishmentId;
    }
    return this.service.findAll(query);
  }

  @Get('student/:studentId')
  @Permissions('payments:read')
  @ApiOperation({ summary: 'Get payments for a student' })
  @ApiResponse({ status: 200, description: 'Student payments retrieved successfully' })
  getStudentPayments(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.service.getStudentPayments(studentId);
  }

  @Get(':id')
  @Permissions('payments:read')
  @ApiOperation({ summary: 'Get a student payment by ID' })
  @ApiResponse({ status: 200, description: 'Student payment retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('payments:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Create a new student payment' })
  @ApiResponse({ status: 201, description: 'Student payment created successfully' })
  create(@Body() dto: CreateStudentPaymentDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('payments:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Update a student payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentPaymentDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Put(':id/status')
  @Permissions('payments:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Update student payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePaymentStatusDto, @CurrentUser() user: any) {
    return this.service.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @Permissions('payments:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete a student payment' })
  @ApiResponse({ status: 200, description: 'Student payment deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
