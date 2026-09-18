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
import { SaaSPlansService } from './saas-plans.service';
import { CreateSaaSPlanDto, UpdateSaaSPlanDto, QuerySaaSPlanDto } from './saas-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('saas-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaaSPlansController {
  constructor(private readonly saasPlansService: SaaSPlansService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all SaaS plans' })
  @ApiResponse({ status: 200, description: 'SaaS plans retrieved successfully' })
  findAll(@Query() query: QuerySaaSPlanDto) {
    return this.saasPlansService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a SaaS plan by ID' })
  @ApiResponse({ status: 200, description: 'SaaS plan retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.saasPlansService.findOne(id);
  }

  @Post()
  @Permissions('billing:create')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Create a new SaaS plan' })
  @ApiResponse({ status: 201, description: 'SaaS plan created successfully' })
  create(@Body() dto: CreateSaaSPlanDto) {
    return this.saasPlansService.create(dto);
  }

  @Put(':id')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Update a SaaS plan' })
  @ApiResponse({ status: 200, description: 'SaaS plan updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSaaSPlanDto) {
    return this.saasPlansService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('billing:delete')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Delete a SaaS plan' })
  @ApiResponse({ status: 200, description: 'SaaS plan deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.saasPlansService.remove(id);
  }

  @Post(':id/modules')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Assign modules to a SaaS plan' })
  @ApiResponse({ status: 200, description: 'Modules assigned successfully' })
  assignModules(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('moduleIds') moduleIds: string[],
  ) {
    return this.saasPlansService.assignModules(id, moduleIds);
  }
}
