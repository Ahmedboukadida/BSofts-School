import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import {
  UpdatePlatformPaymentConfigDto,
  CreateSubscriptionCheckoutDto,
  ClicToPayCallbackDto,
} from './billing.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('gateways')
  @Public()
  @ApiOperation({ summary: 'Get active public payment gateways for SaaS subscriptions' })
  @ApiResponse({ status: 200, description: 'Active gateways list' })
  getActiveGateways() {
    return this.billingService.getActiveGateways();
  }

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SaaS payment gateway configuration (masked for non-root)' })
  @ApiResponse({ status: 200, description: 'Payment gateway configuration' })
  getPlatformConfig(@CurrentUser() user: any) {
    return this.billingService.getPlatformConfig(user);
  }

  @Put('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update SaaS payment gateway configuration (ROOT only)' })
  @ApiResponse({ status: 200, description: 'Payment config updated' })
  updatePlatformConfig(
    @Body() dto: UpdatePlatformPaymentConfigDto,
    @CurrentUser() user: any,
  ) {
    return this.billingService.updatePlatformConfig(dto, user);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription checkout session (Stripe or ClicToPay)' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  createCheckout(
    @Body() dto: CreateSubscriptionCheckoutDto,
    @CurrentUser() user: any,
  ) {
    return this.billingService.createSubscriptionCheckout(dto, user);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm subscription payment and activate plan' })
  @ApiResponse({ status: 200, description: 'Subscription activated' })
  confirmPayment(
    @Body() body: { invoiceId: string; gateway: string; transactionRef?: string },
  ) {
    return this.billingService.confirmSubscriptionPayment(body.invoiceId, body.gateway, body.transactionRef);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current tenant subscription invoices' })
  @ApiResponse({ status: 200, description: 'Invoices list' })
  getMyInvoices(@CurrentUser() user: any) {
    return this.billingService.getMyInvoices(user.id);
  }

  @Get('all-invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all platform invoices across all tenants (ROOT only)' })
  @ApiResponse({ status: 200, description: 'All invoices list' })
  getAllInvoices(@CurrentUser() user: any) {
    return this.billingService.getAllInvoices(user);
  }

  @Post('webhook/stripe')
  @Public()
  @ApiOperation({ summary: 'Stripe Webhook handler with signature verification' })
  @ApiResponse({ status: 200, description: 'Stripe event processed successfully' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    const rawBody = req.rawBody || req.body;
    return this.billingService.handleStripeWebhook(rawBody, signature);
  }

  @Post('webhook/clictopay')
  @Public()
  @ApiOperation({ summary: 'ClicToPay Webhook / IPN handler with checksum verification' })
  @ApiResponse({ status: 200, description: 'ClicToPay event processed successfully' })
  async handleClicToPayWebhook(@Body() dto: ClicToPayCallbackDto) {
    return this.billingService.handleClicToPayWebhook(dto);
  }

  @Get('callback/clictopay')
  @Public()
  @ApiOperation({ summary: 'ClicToPay Browser Callback handler' })
  @ApiResponse({ status: 200, description: 'ClicToPay browser callback handled' })
  async handleClicToPayCallback(@Query() query: ClicToPayCallbackDto) {
    return this.billingService.handleClicToPayWebhook(query);
  }
}

