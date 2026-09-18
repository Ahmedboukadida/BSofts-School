import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeContractsService } from './employee-contracts.service';
import { CreateEmployeeContractDto, UpdateEmployeeContractDto, QueryEmployeeContractDto } from './employee-contract.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Employee Contracts')
@ApiBearerAuth()
@Controller('employee-contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeContractsController {
  constructor(private readonly service: EmployeeContractsService) {}

  @Get()
  @Permissions('employee-contracts:list')
  @ApiOperation({ summary: 'List all employee contracts' })
  @ApiResponse({ status: 200, description: 'Employee contracts retrieved successfully' })
  findAll(@Query() query: QueryEmployeeContractDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('employee-contracts:read')
  @ApiOperation({ summary: 'Get an employee contract by ID' })
  @ApiResponse({ status: 200, description: 'Employee contract retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('employee-contracts:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new employee contract' })
  @ApiResponse({ status: 201, description: 'Employee contract created successfully' })
  create(@Body() dto: CreateEmployeeContractDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('employee-contracts:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update an employee contract' })
  @ApiResponse({ status: 200, description: 'Employee contract updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeContractDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('employee-contracts:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete an employee contract' })
  @ApiResponse({ status: 200, description: 'Employee contract deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
