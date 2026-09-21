import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto, UpdateEstablishmentDto, QueryEstablishmentDto } from './establishment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Establishments')
@ApiBearerAuth()
@Controller('establishments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Get()
  @Permissions('establishments:list')
  @ApiOperation({ summary: 'List all establishments' })
  @ApiResponse({ status: 200, description: 'Establishments retrieved successfully' })
  findAll(@Query() query: QueryEstablishmentDto, @CurrentUser() user?: any) {
    return this.establishmentsService.findAll(query, user);
  }

  @Get(':id')
  @Permissions('establishments:read')
  @ApiOperation({ summary: 'Get establishment by ID' })
  @ApiResponse({ status: 200, description: 'Establishment retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.establishmentsService.findOne(id);
  }

  @Post()
  @Permissions('establishments:create')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Create a new establishment' })
  @ApiResponse({ status: 201, description: 'Establishment created successfully' })
  create(@Body() dto: CreateEstablishmentDto) {
    return this.establishmentsService.create(dto);
  }

  @Put(':id')
  @Permissions('establishments:update')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update an establishment' })
  @ApiResponse({ status: 200, description: 'Establishment updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEstablishmentDto) {
    return this.establishmentsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('establishments:delete')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Delete an establishment' })
  @ApiResponse({ status: 200, description: 'Establishment deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
  ) {
    return this.establishmentsService.remove(id, permanent === 'true');
  }

  @Post(':id/restore')
  @Permissions('establishments:update')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Restore a deactivated establishment' })
  @ApiResponse({ status: 200, description: 'Establishment restored successfully' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.establishmentsService.restore(id);
  }
}

