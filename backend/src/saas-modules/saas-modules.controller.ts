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
import { SaaSModulesService } from './saas-modules.service';
import { CreateSaaSModuleDto, UpdateSaaSModuleDto, QuerySaaSModuleDto } from './saas-module.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('saas-modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaaSModulesController {
  constructor(private readonly saasModulesService: SaaSModulesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all SaaS modules' })
  @ApiResponse({ status: 200, description: 'SaaS modules retrieved successfully' })
  findAll(@Query() query: QuerySaaSModuleDto) {
    return this.saasModulesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a SaaS module by ID' })
  @ApiResponse({ status: 200, description: 'SaaS module retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.saasModulesService.findOne(id);
  }

  @Post()
  @Permissions('billing:create')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Create a new SaaS module' })
  @ApiResponse({ status: 201, description: 'SaaS module created successfully' })
  create(@Body() dto: CreateSaaSModuleDto) {
    return this.saasModulesService.create(dto);
  }

  @Put(':id')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Update a SaaS module' })
  @ApiResponse({ status: 200, description: 'SaaS module updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSaaSModuleDto) {
    return this.saasModulesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('billing:delete')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Delete a SaaS module' })
  @ApiResponse({ status: 200, description: 'SaaS module deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.saasModulesService.remove(id);
  }
}
