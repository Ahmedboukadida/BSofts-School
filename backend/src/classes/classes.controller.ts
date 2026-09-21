import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto, QueryClassDto } from './class.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Classes')
@ApiBearerAuth()
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  @Get()
  @Permissions('classes:list')
  @ApiOperation({ summary: 'List all classes' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  findAll(@Query() query: QueryClassDto) {
    return this.service.findAll(query);
  }

  @Post('promote')
  @Permissions('classes:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Promote students to next class based on bulletins and deliberations' })
  @ApiResponse({ status: 200, description: 'Students processed and promoted successfully' })
  promoteClass(
    @Body() body: { fromClassId: string; targetClassId: string; targetAcademicYearId: string },
    @CurrentUser() user: any,
  ) {
    return this.service.promoteClass(body.fromClassId, body.targetClassId, body.targetAcademicYearId, user);
  }

  @Get(':id')
  @Permissions('classes:read')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('classes:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  create(@Body() dto: CreateClassDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('classes:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClassDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/restore')
  @Permissions('classes:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Restore a deactivated class' })
  @ApiResponse({ status: 200, description: 'Class restored successfully' })
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.service.restore(id, user);
  }

  @Delete(':id')
  @Permissions('classes:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete a class (soft delete for admin, permanent hard delete for root)' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
