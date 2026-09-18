import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherContractsService } from './teacher-contracts.service';
import { CreateTeacherContractDto, UpdateTeacherContractDto, QueryTeacherContractDto } from './teacher-contract.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Teacher Contracts')
@ApiBearerAuth()
@Controller('teacher-contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherContractsController {
  constructor(private readonly service: TeacherContractsService) {}

  @Get()
  @Permissions('teacher-contracts:list')
  @ApiOperation({ summary: 'List all teacher contracts' })
  @ApiResponse({ status: 200, description: 'Teacher contracts retrieved successfully' })
  findAll(@Query() query: QueryTeacherContractDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('teacher-contracts:read')
  @ApiOperation({ summary: 'Get a teacher contract by ID' })
  @ApiResponse({ status: 200, description: 'Teacher contract retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('teacher-contracts:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new teacher contract' })
  @ApiResponse({ status: 201, description: 'Teacher contract created successfully' })
  create(@Body() dto: CreateTeacherContractDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('teacher-contracts:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a teacher contract' })
  @ApiResponse({ status: 200, description: 'Teacher contract updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeacherContractDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('teacher-contracts:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a teacher contract' })
  @ApiResponse({ status: 200, description: 'Teacher contract deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
