import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CaissesService } from './caisses.service';
import { CreateCaisseDto, UpdateCaisseDto, QueryCaisseDto } from './caisse.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Caisses')
@ApiBearerAuth()
@Controller('caisses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CaissesController {
  constructor(private readonly service: CaissesService) {}

  @Get()
  @Permissions('finance:list')
  @ApiOperation({ summary: 'List all caisses' })
  @ApiResponse({ status: 200, description: 'List of caisses retrieved successfully' })
  findAll(@Query() query: QueryCaisseDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get a caisse by ID' })
  @ApiResponse({ status: 200, description: 'Caisse retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/balance')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get caisse balance' })
  @ApiResponse({ status: 200, description: 'Caisse balance retrieved successfully' })
  getBalance(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getBalance(id);
  }

  @Post()
  @Permissions('finance:create')
  @ApiOperation({ summary: 'Create a new caisse' })
  @ApiResponse({ status: 201, description: 'Caisse created successfully' })
  create(@Body() dto: CreateCaisseDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('finance:update')
  @ApiOperation({ summary: 'Update a caisse' })
  @ApiResponse({ status: 200, description: 'Caisse updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCaisseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('finance:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete a caisse (soft delete or permanent delete for root)' })
  @ApiResponse({ status: 200, description: 'Caisse deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
