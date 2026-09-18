import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherPaymentsService } from './teacher-payments.service';
import { CreateTeacherPaymentDto, UpdateTeacherPaymentStatusDto, QueryTeacherPaymentDto } from './teacher-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('teacher-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherPaymentsController {
  constructor(private readonly service: TeacherPaymentsService) {}

  @Get()
  @Permissions('finance:list')
  @ApiOperation({ summary: 'List all teacher payments' })
  @ApiResponse({ status: 200, description: 'Teacher payments retrieved successfully' })
  findAll(@Query() query: QueryTeacherPaymentDto) {
    return this.service.findAll(query);
  }

  @Get('teacher/:teacherId')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get payments for a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher payments retrieved successfully' })
  getTeacherPayments(@Param('teacherId', ParseUUIDPipe) teacherId: string) {
    return this.service.getTeacherPayments(teacherId);
  }

  @Post('generate-payroll')
  @Permissions('finance:create')
  @ApiOperation({ summary: 'Generate monthly teacher payroll based on contracts and completed sessions' })
  @ApiResponse({ status: 201, description: 'Payroll calculated and generated successfully' })
  generatePayroll(
    @Body() body: { period: string; establishmentId?: string },
  ) {
    return this.service.generateMonthlyPayroll(body.period, body.establishmentId);
  }

  @Get(':id')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get a teacher payment by ID' })
  @ApiResponse({ status: 200, description: 'Teacher payment retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('finance:create')
  @ApiOperation({ summary: 'Create a new teacher payment' })
  @ApiResponse({ status: 201, description: 'Teacher payment created successfully' })
  create(@Body() dto: CreateTeacherPaymentDto) {
    return this.service.create(dto);
  }

  @Put(':id/status')
  @Permissions('finance:update')
  @ApiOperation({ summary: 'Update teacher payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeacherPaymentStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @Permissions('finance:delete')
  @ApiOperation({ summary: 'Delete a teacher payment' })
  @ApiResponse({ status: 200, description: 'Teacher payment deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
