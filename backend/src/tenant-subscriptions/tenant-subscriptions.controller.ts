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
import { TenantSubscriptionsService } from './tenant-subscriptions.service';
import {
  CreateTenantSubscriptionDto,
  UpdateTenantSubscriptionDto,
  QueryTenantSubscriptionDto,
  RenewTenantSubscriptionDto,
  ApproveTenantSubscriptionDto,
} from './tenant-subscription.dto';
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

  @Post(':id/approve')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Approve a subscription request' })
  @ApiResponse({ status: 200, description: 'Subscription approved successfully' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveTenantSubscriptionDto,
  ) {
    return this.tenantSubscriptionsService.approve(id, dto?.approvedBy);
  }

  @Post(':id/renew')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Renew a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription renewed successfully' })
  renew(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RenewTenantSubscriptionDto,
  ) {
    return this.tenantSubscriptionsService.renew(id, dto?.months, dto?.newEndDate);
  }

  @Delete(':id')
  @Permissions('billing:delete')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Cancel or permanently delete a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription deleted or cancelled successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
  ) {
    return this.tenantSubscriptionsService.remove(id, permanent === 'true');
  }

  @Post(':id/restore')
  @Permissions('billing:update')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Restore a cancelled subscription' })
  @ApiResponse({ status: 200, description: 'Subscription restored successfully' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantSubscriptionsService.restore(id);
  }
}
