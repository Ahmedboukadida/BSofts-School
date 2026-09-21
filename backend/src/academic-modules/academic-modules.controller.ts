import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicModulesService } from './academic-modules.service';
import { CreateAcademicModuleDto, UpdateAcademicModuleDto, QueryAcademicModuleDto } from './academic-module.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Academic')
@ApiBearerAuth()
@Controller('academic-modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicModulesController {
  constructor(private readonly service: AcademicModulesService) {}

  @Get()
  @Permissions('academic-modules:list')
  @ApiOperation({ summary: 'List all academic modules' })
  @ApiResponse({ status: 200, description: 'Academic modules retrieved successfully' })
  findAll(@Query() query: QueryAcademicModuleDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('academic-modules:read')
  @ApiOperation({ summary: 'Get an academic module by ID' })
  @ApiResponse({ status: 200, description: 'Academic module retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('academic-modules:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new academic module' })
  @ApiResponse({ status: 201, description: 'Academic module created successfully' })
  create(@Body() dto: CreateAcademicModuleDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('academic-modules:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update an academic module' })
  @ApiResponse({ status: 200, description: 'Academic module updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAcademicModuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('academic-modules:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete an academic module (soft delete or permanent delete for root)' })
  @ApiResponse({ status: 200, description: 'Academic module deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }

  @Post(':id/restore')
  @Permissions('academic-modules:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Restore an academic module' })
  @ApiResponse({ status: 200, description: 'Academic module restored successfully' })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.service.restore(id, user);
  }
}
