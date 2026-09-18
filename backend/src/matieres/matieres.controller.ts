import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatieresService } from './matieres.service';
import { CreateMatiereDto, UpdateMatiereDto, QueryMatiereDto } from './matiere.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Academic')
@ApiBearerAuth()
@Controller('matieres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatieresController {
  constructor(private readonly service: MatieresService) {}

  @Get()
  @Permissions('matieres:list')
  @ApiOperation({ summary: 'List all matieres' })
  @ApiResponse({ status: 200, description: 'Matieres retrieved successfully' })
  findAll(@Query() query: QueryMatiereDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('matieres:read')
  @ApiOperation({ summary: 'Get a matiere by ID' })
  @ApiResponse({ status: 200, description: 'Matiere retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('matieres:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new matiere' })
  @ApiResponse({ status: 201, description: 'Matiere created successfully' })
  create(@Body() dto: CreateMatiereDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('matieres:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a matiere' })
  @ApiResponse({ status: 200, description: 'Matiere updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMatiereDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('matieres:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a matiere' })
  @ApiResponse({ status: 200, description: 'Matiere deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
