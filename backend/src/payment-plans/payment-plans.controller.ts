import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentPlansService } from './payment-plans.service';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto, QueryPaymentPlanDto } from './payment-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Payment Plans')
@ApiBearerAuth()
@Controller('payment-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentPlansController {
  constructor(private readonly service: PaymentPlansService) {}

  @Get()
  @Permissions('payment-plans:list')
  @ApiOperation({ summary: 'List all payment plans' })
  @ApiResponse({ status: 200, description: 'Payment plans retrieved successfully' })
  findAll(@Query() query: QueryPaymentPlanDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('payment-plans:read')
  @ApiOperation({ summary: 'Get a payment plan by ID' })
  @ApiResponse({ status: 200, description: 'Payment plan retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('payment-plans:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new payment plan' })
  @ApiResponse({ status: 201, description: 'Payment plan created successfully' })
  create(@Body() dto: CreatePaymentPlanDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('payment-plans:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a payment plan' })
  @ApiResponse({ status: 200, description: 'Payment plan updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePaymentPlanDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('payment-plans:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a payment plan' })
  @ApiResponse({ status: 200, description: 'Payment plan deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
