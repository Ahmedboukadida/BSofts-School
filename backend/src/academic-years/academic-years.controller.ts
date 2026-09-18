import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto, QueryAcademicYearDto } from './academic-year.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Academic')
@ApiBearerAuth()
@Controller('academic-years')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicYearsController {
  constructor(private readonly service: AcademicYearsService) {}

  @Get()
  @Permissions('classes:list')
  @ApiOperation({ summary: 'List all academic years' })
  @ApiResponse({ status: 200, description: 'Academic years retrieved successfully' })
  findAll(@Query() query: QueryAcademicYearDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('classes:read')
  @ApiOperation({ summary: 'Get an academic year by ID' })
  @ApiResponse({ status: 200, description: 'Academic year retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('classes:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new academic year' })
  @ApiResponse({ status: 201, description: 'Academic year created successfully' })
  create(@Body() dto: CreateAcademicYearDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('classes:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update an academic year' })
  @ApiResponse({ status: 200, description: 'Academic year updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAcademicYearDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('classes:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete an academic year' })
  @ApiResponse({ status: 200, description: 'Academic year deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Put(':id/set-current')
  @Permissions('classes:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Set an academic year as current' })
  @ApiResponse({ status: 200, description: 'Academic year set as current successfully' })
  setCurrent(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.setCurrent(id);
  }
}
