import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdatePlatformPaymentConfigDto,
  CreateSubscriptionCheckoutDto,
  PaymentGatewayType,
  ClicToPayCallbackDto,
} from './billing.dto';
import Stripe from 'stripe';
import * as crypto from 'node:crypto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPlatformConfig(user?: any) {
    let config = await this.prisma.platformPaymentConfig.findFirst({
      where: { isDefault: true },
    });

    if (!config) {
      config = await this.prisma.platformPaymentConfig.create({
        data: {
          isDefault: true,
          currency: 'TND',
          stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
          stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
          stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
          stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
          clicToPayEnabled: true,
          clicToPayMerchantId: process.env.CLICTOPAY_MERCHANT_ID || 'TEST_BSOFTS_01',
          clicToPayApiKey: process.env.CLICTOPAY_API_KEY || 'API_TEST_KEY',
          clicToPaySecretKey: process.env.CLICTOPAY_SECRET_KEY || 'SECRET_TEST_KEY',
          clicToPayTestMode: true,
        },
      });
    }

    const availableGateways: PaymentGatewayType[] = [];
    if (config.clicToPayEnabled) availableGateways.push(PaymentGatewayType.CLIC_TO_PAY);
    if (config.stripeEnabled) availableGateways.push(PaymentGatewayType.STRIPE);

    // Mask secrets for non-root users
    if (!user?.isRoot) {
      return {
        id: config.id,
        currency: config.currency,
        stripeEnabled: config.stripeEnabled,
        stripePublicKey: config.stripePublicKey,
        clicToPayEnabled: config.clicToPayEnabled,
        clicToPayTestMode: config.clicToPayTestMode,
        clicToPayMerchantId: config.clicToPayMerchantId ? 'configured' : null,
        availableGateways,
      };
    }

    return {
      ...config,
      availableGateways,
    };
  }

  async getActiveGateways() {
    const config = await this.prisma.platformPaymentConfig.findFirst({
      where: { isDefault: true },
    });

    const availableGateways: PaymentGatewayType[] = [];
    if (config?.clicToPayEnabled) availableGateways.push(PaymentGatewayType.CLIC_TO_PAY);
    if (config?.stripeEnabled) availableGateways.push(PaymentGatewayType.STRIPE);

    return {
      currency: config?.currency || 'TND',
      clicToPayEnabled: Boolean(config?.clicToPayEnabled),
      stripeEnabled: Boolean(config?.stripeEnabled),
      availableGateways,
    };
  }

  async updatePlatformConfig(dto: UpdatePlatformPaymentConfigDto, user?: any) {
    if (!user?.isRoot) {
      throw new UnauthorizedException('Seul l\'administrateur ROOT peut configurer les passerelles de paiement.');
    }

    const existing = await this.prisma.platformPaymentConfig.findFirst({
      where: { isDefault: true },
    });

    if (existing) {
      return this.prisma.platformPaymentConfig.update({
        where: { id: existing.id },
        data: {
          currency: dto.currency ?? existing.currency,
          stripeEnabled: dto.stripeEnabled ?? existing.stripeEnabled,
          stripePublicKey: dto.stripePublicKey !== undefined ? dto.stripePublicKey : existing.stripePublicKey,
          stripeSecretKey: dto.stripeSecretKey !== undefined ? dto.stripeSecretKey : existing.stripeSecretKey,
          stripeWebhookSecret: dto.stripeWebhookSecret !== undefined ? dto.stripeWebhookSecret : existing.stripeWebhookSecret,
          clicToPayEnabled: dto.clicToPayEnabled ?? existing.clicToPayEnabled,
          clicToPayMerchantId: dto.clicToPayMerchantId !== undefined ? dto.clicToPayMerchantId : existing.clicToPayMerchantId,
          clicToPayApiKey: dto.clicToPayApiKey !== undefined ? dto.clicToPayApiKey : existing.clicToPayApiKey,
          clicToPaySecretKey: dto.clicToPaySecretKey !== undefined ? dto.clicToPaySecretKey : existing.clicToPaySecretKey,
          clicToPayTestMode: dto.clicToPayTestMode ?? existing.clicToPayTestMode,
        },
      });
    }

    return this.prisma.platformPaymentConfig.create({
      data: {
        isDefault: true,
        currency: dto.currency || 'TND',
        stripeEnabled: dto.stripeEnabled ?? false,
        stripePublicKey: dto.stripePublicKey || '',
        stripeSecretKey: dto.stripeSecretKey || '',
        stripeWebhookSecret: dto.stripeWebhookSecret || '',
        clicToPayEnabled: dto.clicToPayEnabled ?? false,
        clicToPayMerchantId: dto.clicToPayMerchantId || '',
        clicToPayApiKey: dto.clicToPayApiKey || '',
        clicToPaySecretKey: dto.clicToPaySecretKey || '',
        clicToPayTestMode: dto.clicToPayTestMode ?? true,
      },
    });
  }

  async createSubscriptionCheckout(dto: CreateSubscriptionCheckoutDto, user: any) {
    // 1. Identify Tenant
    const tenant = await this.prisma.tenant.findFirst({
      where: { userId: user.id },
    });

    if (!tenant) {
      throw new BadRequestException('Aucun compte établissement (Tenant) associé à cet utilisateur.');
    }

    // 2. Identify Plan
    const plan = await this.prisma.saaSPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan d'abonnement introuvable (ID: ${dto.planId})`);
    }

    const periodMonths = dto.periodMonths || 1;
    const totalAmount = Number(plan.price) * periodMonths;
    let config = await this.prisma.platformPaymentConfig.findFirst({
      where: { isDefault: true },
    });
    if (!config) {
      config = await this.prisma.platformPaymentConfig.create({
        data: {
          isDefault: true,
          currency: 'TND',
          stripeEnabled: true,
          clicToPayEnabled: true,
        },
      });
    }

    // Verify that the requested gateway is currently enabled by the Platform Root
    if (dto.gateway === PaymentGatewayType.STRIPE && !config.stripeEnabled) {
      throw new BadRequestException('Le mode de paiement par carte internationale (Stripe) n\'est pas activé sur la plateforme.');
    }
    if (dto.gateway === PaymentGatewayType.CLIC_TO_PAY && !config.clicToPayEnabled) {
      throw new BadRequestException('Le mode de paiement ClicToPay n\'est pas activé sur la plateforme.');
    }

    // 3. Create Pending Invoice
    const invoice = await this.prisma.saaSInvoice.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        amount: totalAmount,
        currency: config.currency || 'TND',
        gateway: dto.gateway,
        periodMonths,
        status: 'PENDING',
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://bsofts-school.vercel.app';
    const successUrl = dto.successUrl || `${frontendUrl}/settings/subscription?status=success&invoiceId=${invoice.id}`;
    const cancelUrl = dto.cancelUrl || `${frontendUrl}/settings/subscription?status=cancelled`;

    // 4. Dispatch to Gateway
    if (dto.gateway === PaymentGatewayType.STRIPE) {
      if (!config.stripeSecretKey && !process.env.STRIPE_SECRET_KEY) {
        // Fallback test mode session if secret not yet supplied
        return {
          invoiceId: invoice.id,
          gateway: 'STRIPE',
          checkoutUrl: `${frontendUrl}/settings/subscription?mockPayment=stripe&invoiceId=${invoice.id}`,
          message: 'Mode Test Stripe : Clé API non configurée par Root. Redirection vers validation simulée.',
        };
      }

      const stripe = new Stripe(config.stripeSecretKey || process.env.STRIPE_SECRET_KEY!);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: (config.currency || 'eur').toLowerCase(),
              product_data: {
                name: `Abonnement BSofts School — ${plan.name}`,
                description: `${periodMonths} mois d'abonnement SaaS`,
              },
              unit_amount: Math.round(Number(plan.price) * 100),
            },
            quantity: periodMonths,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        client_reference_id: invoice.id,
        customer_email: user.email || undefined,
        metadata: {
          invoiceId: invoice.id,
          tenantId: tenant.id,
          planId: plan.id,
        },
      });

      await this.prisma.saaSInvoice.update({
        where: { id: invoice.id },
        data: { gatewayRef: session.id },
      });

      return {
        invoiceId: invoice.id,
        gateway: 'STRIPE',
        checkoutUrl: session.url,
      };
    } else if (dto.gateway === PaymentGatewayType.CLIC_TO_PAY) {
      // ClicToPay (Monétique Tunisie / SMT) Protocol
      // Amount in Millimes (1 TND = 1000 Millimes)
      const amountInMillimes = Math.round(totalAmount * 1000);
      const orderNumber = `BS-${invoice.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      await this.prisma.saaSInvoice.update({
        where: { id: invoice.id },
        data: { gatewayRef: orderNumber },
      });

      if (config.clicToPayTestMode || !config.clicToPayApiKey) {
        // Test / Sandbox mode URL
        return {
          invoiceId: invoice.id,
          gateway: 'CLIC_TO_PAY',
          orderNumber,
          amountMillimes: amountInMillimes,
          checkoutUrl: `${frontendUrl}/settings/subscription?mockPayment=clictopay&invoiceId=${invoice.id}&orderNumber=${orderNumber}`,
          message: 'Mode Test ClicToPay actif. Redirection vers la passerelle de test.',
        };
      }

      // Production ClicToPay API endpoint
      const clicToPayEndpoint = config.clicToPayTestMode
        ? 'https://test.clictopay.com/payment/rest/register.do'
        : 'https://clictopay.com/payment/rest/register.do';

      const returnUrl = `${frontendUrl}/api/billing/callback/clictopay?invoiceId=${invoice.id}`;

      try {
        const params = new URLSearchParams({
          userName: config.clicToPayMerchantId || '',
          password: config.clicToPayApiKey || '',
          orderNumber,
          amount: amountInMillimes.toString(),
          currency: '788', // TND ISO code
          returnUrl,
          failUrl: cancelUrl,
          description: `Abonnement BSofts School ${plan.name} (${periodMonths} mois)`,
        });

        const response = await fetch(`${clicToPayEndpoint}?${params.toString()}`, {
          method: 'POST',
        });
        const data = await response.json();

        if (data.formUrl) {
          return {
            invoiceId: invoice.id,
            gateway: 'CLIC_TO_PAY',
            checkoutUrl: data.formUrl,
          };
        } else {
          this.logger.warn(`ClicToPay order registration response: ${JSON.stringify(data)}`);
          // Fallback to test checkout if registration refused by sandbox
          return {
            invoiceId: invoice.id,
            gateway: 'CLIC_TO_PAY',
            checkoutUrl: `${frontendUrl}/settings/subscription?mockPayment=clictopay&invoiceId=${invoice.id}&orderNumber=${orderNumber}`,
          };
        }
      } catch (err: any) {
        this.logger.error(`Failed to register ClicToPay order: ${err.message}`);
        return {
          invoiceId: invoice.id,
          gateway: 'CLIC_TO_PAY',
          checkoutUrl: `${frontendUrl}/settings/subscription?mockPayment=clictopay&invoiceId=${invoice.id}&orderNumber=${orderNumber}`,
        };
      }
    }

    throw new BadRequestException(`Passerelle de paiement ${dto.gateway} non prise en charge.`);
  }

  async confirmSubscriptionPayment(invoiceId: string, gateway: string, transactionRef?: string) {
    const invoice = await this.prisma.saaSInvoice.findUnique({
      where: { id: invoiceId },
      include: { tenant: true, plan: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Facture ${invoiceId} introuvable`);
    }

    if (invoice.status === 'PAID') {
      return { success: true, message: 'Facture déjà réglée', invoice };
    }

    // 1. Mark Invoice Paid
    const updatedInvoice = await this.prisma.saaSInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        gatewayRef: transactionRef || invoice.gatewayRef,
      },
    });

    // 2. Extend/Activate Tenant Subscription
    const now = new Date();
    const endDate = new Date(now.getTime() + (invoice.periodMonths || 1) * 30 * 24 * 3600 * 1000);

    const existingSub = await this.prisma.tenantSubscription.findFirst({
      where: { tenantId: invoice.tenantId },
    });

    if (existingSub) {
      await this.prisma.tenantSubscription.update({
        where: { id: existingSub.id },
        data: {
          planId: invoice.planId,
          status: 'ACTIVE',
          startDate: now,
          endDate,
          updatedAt: now,
        },
      });
    } else {
      await this.prisma.tenantSubscription.create({
        data: {
          tenantId: invoice.tenantId,
          planId: invoice.planId,
          status: 'ACTIVE',
          startDate: now,
          endDate,
        },
      });
    }

    this.logger.log(`Subscription activated for tenant ${invoice.tenantId} via ${gateway} (Invoice: ${invoiceId})`);
    return {
      success: true,
      message: 'Abonnement activé avec succès',
      invoice: updatedInvoice,
    };
  }

  async getMyInvoices(userId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { userId },
    });

    if (!tenant) {
      return [];
    }

    return this.prisma.saaSInvoice.findMany({
      where: { tenantId: tenant.id },
      include: { plan: { select: { id: true, name: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllInvoices(user: any) {
    if (!user?.isRoot) {
      throw new UnauthorizedException('Accès réservé à l\'administrateur ROOT.');
    }

    return this.prisma.saaSInvoice.findMany({
      include: {
        tenant: { select: { id: true, name: true, user: { select: { email: true, firstName: true, lastName: true } } } },
        plan: { select: { id: true, name: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
