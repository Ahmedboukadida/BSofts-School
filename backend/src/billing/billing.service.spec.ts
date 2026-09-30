import { describe, beforeEach, it, expect, vi } from 'vitest';
import { BillingService } from './billing.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'node:crypto';

// Mock Stripe library
vi.mock('stripe', () => {
  class MockStripe {
    webhooks = {
      constructEvent: vi.fn((payload: any, signature: string, secret: string) => {
        if (signature === 'invalid-signature') {
          throw new Error('Invalid signature');
        }
        const raw = Buffer.isBuffer(payload) ? payload.toString('utf-8') : payload;
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      }),
    };
  }

  return {
    default: MockStripe,
  };
});

describe('BillingService', () => {
  let service: BillingService;
  let cryptoService: CryptoService;
  let mockPrisma: any;

  beforeEach(() => {
    cryptoService = new CryptoService();
    mockPrisma = {
      platformPaymentConfig: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      saaSInvoice: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      tenantSubscription: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      tenant: {
        findFirst: vi.fn(),
      },
    };

    service = new BillingService(mockPrisma, cryptoService);
  });

  describe('handleStripeWebhook', () => {
    it('should throw BadRequestException if signature is missing', async () => {
      await expect(
        service.handleStripeWebhook(Buffer.from('{}'), undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if Stripe secret is not configured', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue(null);
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      try {
        await expect(
          service.handleStripeWebhook(Buffer.from('{}'), 'sig_123'),
        ).rejects.toThrow('Clé secrète webhook Stripe non configurée');
      } finally {
        if (originalSecret) process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
      }
    });

    it('should reject webhook with invalid signature', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        stripeWebhookSecret: 'whsec_test',
        stripeSecretKey: 'sk_test',
      });

      await expect(
        service.handleStripeWebhook(Buffer.from('{}'), 'invalid-signature'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should process checkout.session.completed event and activate subscription', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        stripeWebhookSecret: 'whsec_test',
        stripeSecretKey: 'sk_test',
      });

      const eventPayload = {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_999',
            metadata: { invoiceId: 'inv-456' },
          },
        },
      };

      const mockInvoice = {
        id: 'inv-456',
        tenantId: 'tenant-1',
        planId: 'plan-pro',
        periodMonths: 1,
        status: 'PENDING',
      };

      mockPrisma.saaSInvoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrisma.saaSInvoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID' });
      mockPrisma.tenantSubscription.findFirst.mockResolvedValue(null);
      mockPrisma.tenantSubscription.create.mockResolvedValue({ id: 'sub-1' });

      const rawBuffer = Buffer.from(JSON.stringify(eventPayload));
      const result = await service.handleStripeWebhook(rawBuffer, 'valid-signature');

      expect(result).toEqual({ received: true, event: 'checkout.session.completed' });
      expect(mockPrisma.saaSInvoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-456' },
          data: expect.objectContaining({ status: 'PAID', gatewayRef: 'pi_test_999' }),
        }),
      );
      expect(mockPrisma.tenantSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            planId: 'plan-pro',
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('should mark invoice CANCELLED on checkout.session.async_payment_failed', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        stripeWebhookSecret: 'whsec_test',
        stripeSecretKey: 'sk_test',
      });

      const eventPayload = {
        id: 'evt_fail_123',
        type: 'checkout.session.async_payment_failed',
        data: {
          object: {
            id: 'cs_test_fail',
            metadata: { invoiceId: 'inv-fail-1' },
          },
        },
      };

      const rawBuffer = Buffer.from(JSON.stringify(eventPayload));
      const result = await service.handleStripeWebhook(rawBuffer, 'valid-signature');

      expect(result).toEqual({ received: true, event: 'checkout.session.async_payment_failed' });
      expect(mockPrisma.saaSInvoice.updateMany).toHaveBeenCalledWith({
        where: { id: 'inv-fail-1', status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });
    });
  });

  describe('handleClicToPayWebhook', () => {
    it('should reject webhook with invalid checksum signature', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        clicToPaySecretKey: 'SECRET_TEST_KEY',
      });

      await expect(
        service.handleClicToPayWebhook({
          orderNumber: 'ORD-100',
          orderId: 'ORDER-ID-1',
          respCode: '00',
          checksum: 'tampered-checksum-hash',
        }),
      ).rejects.toThrow('Checksum ClicToPay invalide: falsification de signature détectée');
    });

    it('should throw NotFoundException if invoice cannot be found', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        clicToPaySecretKey: 'SECRET_TEST_KEY',
      });
      mockPrisma.saaSInvoice.findFirst.mockResolvedValue(null);

      const secret = 'SECRET_TEST_KEY';
      const orderNumber = 'ORD-UNKNOWN';
      const orderId = 'ORD-ID-UNKNOWN';
      const respCode = '00';
      const validChecksum = crypto
        .createHash('sha256')
        .update(`${orderNumber}${orderId}${respCode}${secret}`)
        .digest('hex');

      await expect(
        service.handleClicToPayWebhook({
          orderNumber,
          orderId,
          respCode,
          checksum: validChecksum,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully confirm payment and activate subscription on valid ClicToPay callback', async () => {
      const secret = 'SECRET_TEST_KEY';
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        clicToPaySecretKey: secret,
      });

      const orderNumber = 'ORD-555';
      const orderId = 'ORDER-ID-555';
      const respCode = '00';
      const validChecksum = crypto
        .createHash('sha256')
        .update(`${orderNumber}${orderId}${respCode}${secret}`)
        .digest('hex');

      const mockInvoice = {
        id: 'inv-clic-555',
        tenantId: 'tenant-tn-1',
        planId: 'plan-enterprise',
        periodMonths: 12,
        status: 'PENDING',
        gatewayRef: orderNumber,
      };

      mockPrisma.saaSInvoice.findFirst.mockResolvedValue(mockInvoice);
      mockPrisma.saaSInvoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrisma.saaSInvoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID' });
      mockPrisma.tenantSubscription.findFirst.mockResolvedValue({
        id: 'existing-sub-1',
        tenantId: 'tenant-tn-1',
      });
      mockPrisma.tenantSubscription.update.mockResolvedValue({ id: 'existing-sub-1', status: 'ACTIVE' });

      const result = await service.handleClicToPayWebhook({
        orderNumber,
        orderId,
        respCode,
        checksum: validChecksum,
      });

      expect(result.success).toBe(true);
      expect(result.invoiceId).toBe('inv-clic-555');
      expect(mockPrisma.saaSInvoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-clic-555' },
          data: expect.objectContaining({ status: 'PAID', gatewayRef: orderId }),
        }),
      );
      expect(mockPrisma.tenantSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'existing-sub-1' },
          data: expect.objectContaining({ status: 'ACTIVE', planId: 'plan-enterprise' }),
        }),
      );
    });

    it('should mark invoice CANCELLED when ClicToPay response code indicates rejection', async () => {
      const secret = 'SECRET_TEST_KEY';
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        clicToPaySecretKey: secret,
      });

      const orderNumber = 'ORD-REFUSED';
      const orderId = 'ORDER-ID-REFUSED';
      const respCode = '05'; // Do not honor / Refused
      const validChecksum = crypto
        .createHash('sha256')
        .update(`${orderNumber}${orderId}${respCode}${secret}`)
        .digest('hex');

      const mockInvoice = {
        id: 'inv-refused',
        tenantId: 'tenant-1',
        status: 'PENDING',
        gatewayRef: orderNumber,
      };

      mockPrisma.saaSInvoice.findFirst.mockResolvedValue(mockInvoice);
      mockPrisma.saaSInvoice.update.mockResolvedValue({ ...mockInvoice, status: 'CANCELLED' });

      const result = await service.handleClicToPayWebhook({
        orderNumber,
        orderId,
        respCode,
        checksum: validChecksum,
      });

      expect(result.success).toBe(false);
      expect(mockPrisma.saaSInvoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-refused' },
        data: { status: 'CANCELLED' },
      });
    });
  });

  describe('confirmSubscriptionPayment', () => {
    it('should throw NotFoundException if invoice does not exist', async () => {
      mockPrisma.saaSInvoice.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmSubscriptionPayment('inv-not-found', 'STRIPE'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return early if invoice is already PAID', async () => {
      const invoice = { id: 'inv-already-paid', status: 'PAID' };
      mockPrisma.saaSInvoice.findUnique.mockResolvedValue(invoice);

      const result = await service.confirmSubscriptionPayment('inv-already-paid', 'STRIPE');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Facture déjà réglée');
      expect(mockPrisma.saaSInvoice.update).not.toHaveBeenCalled();
    });
  });

  describe('getPlatformConfig', () => {
    it('should mask sensitive secret keys for non-root users', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        id: 'config-1',
        currency: 'TND',
        stripeEnabled: true,
        stripePublicKey: 'pk_live_123',
        stripeSecretKey: 'sk_live_SECRET',
        stripeWebhookSecret: 'whsec_SECRET',
        clicToPayEnabled: true,
        clicToPayMerchantId: 'MERCHANT_01',
        clicToPayApiKey: 'API_KEY_SECRET',
        clicToPaySecretKey: 'SECRET_KEY_SECRET',
      });

      const config = await service.getPlatformConfig({ isRoot: false });

      expect(config.stripeSecretKey).toBeUndefined();
      expect(config.stripeWebhookSecret).toBeUndefined();
      expect(config.clicToPayApiKey).toBeUndefined();
      expect(config.clicToPaySecretKey).toBeUndefined();
      expect(config.stripePublicKey).toBe('pk_live_123');
    });

    it('should return full secrets for ROOT user', async () => {
      const dbConfig = {
        id: 'config-1',
        currency: 'TND',
        stripeEnabled: true,
        stripePublicKey: 'pk_live_123',
        stripeSecretKey: 'sk_live_SECRET',
        stripeWebhookSecret: 'whsec_SECRET',
        clicToPayEnabled: true,
        clicToPayMerchantId: 'MERCHANT_01',
        clicToPayApiKey: 'API_KEY_SECRET',
        clicToPaySecretKey: 'SECRET_KEY_SECRET',
      };
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue(dbConfig);

      const config = await service.getPlatformConfig({ isRoot: true });

      expect(config.stripeSecretKey).toBe('sk_live_SECRET');
      expect(config.clicToPaySecretKey).toBe('SECRET_KEY_SECRET');
    });

    it('should encrypt secret keys at rest when updating platform config', async () => {
      mockPrisma.platformPaymentConfig.findFirst.mockResolvedValue({
        id: 'cfg-platform-1',
        stripeSecretKey: '',
      });
      mockPrisma.platformPaymentConfig.update.mockImplementation(async ({ data }: any) => ({
        id: 'cfg-platform-1',
        ...data,
      }));

      await service.updatePlatformConfig(
        {
          stripeSecretKey: 'sk_test_newsecret123',
          clicToPaySecretKey: 'smt_test_newsecret456',
        },
        { isRoot: true },
      );

      expect(mockPrisma.platformPaymentConfig.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cfg-platform-1' },
          data: expect.objectContaining({
            stripeSecretKey: expect.stringMatching(/^enc:v1:/),
            clicToPaySecretKey: expect.stringMatching(/^enc:v1:/),
          }),
        }),
      );
    });
  });
});

