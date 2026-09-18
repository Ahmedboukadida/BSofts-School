import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantSubscriptionsService } from './tenant-subscriptions.service';
import { CreateTenantSubscriptionDto, UpdateTenantSubscriptionDto, QueryTenantSubscriptionDto } from './tenant-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenant-subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantSubscriptionsController {
  constructor(private readonly tenantSubscriptionsService: TenantSubscriptionsService) {}

  @Get()
  @Permissions('billing:list')
  @ApiOperation({ summary: 'List all tenant subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  findAll(@Query() query: QueryTenantSubscriptionDto) {
    return this.tenantSubscriptionsService.findAll(query);
  }

  @Get(':id')
  @Permissions('billing:read')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantSubscriptionsService.findOne(id);
  }

  @Get('tenant/:tenantId')
  @Permissions('billing:read')
  @ApiOperation({ summary: 'Get subscription by tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant subscription retrieved successfully' })
  getTenantSubscription(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.tenantSubscriptionsService.getTenantSubscription(tenantId);
  }

  @Post()
  @Permissions('billing:create')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  create(@Body() dto: CreateTenantSubscriptionDto) {
    return this.tenantSubscriptionsService.create(dto);
  }

  @Put(':id')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTenantSubscriptionDto) {
    return this.tenantSubscriptionsService.update(id, dto);
  }

  @Put(':id/cancel')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantSubscriptionsService.cancel(id);
  }
}
