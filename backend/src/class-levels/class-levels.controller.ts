import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClassLevelsService } from './class-levels.service';
import { CreateClassLevelDto, UpdateClassLevelDto, QueryClassLevelDto } from './class-level.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Class Levels')
@ApiBearerAuth()
@Controller('class-levels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassLevelsController {
  constructor(private readonly service: ClassLevelsService) {}

  @Get()
  @Permissions('class-levels:list')
  @ApiOperation({ summary: 'List all class levels' })
  @ApiResponse({ status: 200, description: 'Class levels retrieved successfully' })
  findAll(@Query() query: QueryClassLevelDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('class-levels:read')
  @ApiOperation({ summary: 'Get a class level by ID' })
  @ApiResponse({ status: 200, description: 'Class level retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('class-levels:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new class level' })
  @ApiResponse({ status: 201, description: 'Class level created successfully' })
  create(@Body() dto: CreateClassLevelDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('class-levels:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a class level' })
  @ApiResponse({ status: 200, description: 'Class level updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClassLevelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('class-levels:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a class level' })
  @ApiResponse({ status: 200, description: 'Class level deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
