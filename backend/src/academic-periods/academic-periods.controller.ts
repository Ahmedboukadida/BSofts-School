import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicPeriodsService } from './academic-periods.service';
import { CreateAcademicPeriodDto, UpdateAcademicPeriodDto, QueryAcademicPeriodDto } from './academic-period.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Academic')
@ApiBearerAuth()
@Controller('academic-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicPeriodsController {
  constructor(private readonly service: AcademicPeriodsService) {}

  @Get()
  @Permissions('classes:list')
  @ApiOperation({ summary: 'List all academic periods' })
  @ApiResponse({ status: 200, description: 'Academic periods retrieved successfully' })
  findAll(@Query() query: QueryAcademicPeriodDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('classes:read')
  @ApiOperation({ summary: 'Get an academic period by ID' })
  @ApiResponse({ status: 200, description: 'Academic period retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('classes:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new academic period' })
  @ApiResponse({ status: 201, description: 'Academic period created successfully' })
  create(@Body() dto: CreateAcademicPeriodDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('classes:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update an academic period' })
  @ApiResponse({ status: 200, description: 'Academic period updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAcademicPeriodDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('classes:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete an academic period' })
  @ApiResponse({ status: 200, description: 'Academic period deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
