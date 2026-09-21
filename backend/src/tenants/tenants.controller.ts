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
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Permissions('establishments:list')
  @ApiOperation({ summary: 'List all tenants' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully' })
  findAll(@Query() query: any) {
    return this.tenantsService.findAll(query);
  }

  @Get(':id')
  @Permissions('establishments:read')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @Permissions('establishments:create')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  create(@Body() dto: any) {
    return this.tenantsService.create(dto);
  }

  @Put(':id')
  @Permissions('establishments:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.tenantsService.update(id, dto);
  }

  @Post(':id/restore')
  @Permissions('establishments:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Restore a deactivated tenant' })
  @ApiResponse({ status: 200, description: 'Tenant restored successfully' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.restore(id);
  }

  @Delete(':id')
  @Permissions('establishments:delete')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
  ) {
    return this.tenantsService.remove(id, permanent === 'true');
  }
}

