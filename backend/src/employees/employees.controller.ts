import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './employee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @Permissions('employees:list')
  @ApiOperation({ summary: 'List all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  findAll(@Query() query: QueryEmployeeDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('employees:read')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('employees:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('employees:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/restore')
  @Permissions('employees:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Restore a deactivated employee' })
  @ApiResponse({ status: 200, description: 'Employee restored successfully' })
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.service.restore(id, user);
  }

  @Delete(':id')
  @Permissions('employees:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete an employee (soft delete or permanent delete for root)' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
