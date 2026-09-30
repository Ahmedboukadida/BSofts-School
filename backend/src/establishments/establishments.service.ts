import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedDto } from '../common/pagination.dto';
import { CryptoService } from '../common/crypto/crypto.service';

@Injectable()
export class EstablishmentsService {
  constructor(
    private prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async findAll(query: any, user?: any) {
    const { page = 1, limit = 10, search, tenantId, isActive, sortBy, sortOrder, includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    const isRoot = user?.isRoot || user?.role === 'ROOT';
    if (!isRoot && user?.tenantId) {
      where.tenantId = user.tenantId;
    } else if (tenantId && tenantId !== 'ALL' && tenantId !== 'all' && tenantId !== 'undefined' && tenantId !== 'null') {
      where.tenantId = tenantId;
    }

    if (isActive !== undefined) {
      where.isActive = typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
    }

    if (includeDeleted) {
      where.OR = [{ isDeleted: true }, { isActive: false }];
    } else {
      where.isDeleted = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tenant: {
            select: { id: true, user: { select: { firstName: true, lastName: true } } },
          },
          _count: {
            select: { classes: true, students: true, teachers: true },
          },
        },
      }),
      this.prisma.establishment.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { id: true, user: { select: { firstName: true, lastName: true } } },
        },
        classes: {
          select: { id: true, name: true, code: true },
          take: 10,
        },
        userRoles: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            role: { select: { name: true } },
          },
          take: 10,
        },
        configs: { take: 1 },
      },
    });

    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    return establishment;
  }

  async create(dto: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException(`Tenant with ID ${dto.tenantId} not found`);

    let baseSlug = (dto.slug || dto.code || dto.name || 'etablissement')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = 'etablissement';

    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.establishment.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.establishment.create({
      data: {
        name: dto.name,
        slug,
        category: dto.category || 'HIGH_SCHOOL',
        country: dto.country || 'TN',
        timezone: dto.timezone || 'Africa/Tunis',
        email: dto.email || null,
        phone: dto.phone || null,
        address: dto.address || null,
        logo: dto.logo || null,
        website: dto.website || null,
        isActive: dto.isActive ?? true,
        tenantId: dto.tenantId,
      },
      include: {
        tenant: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async update(id: string, dto: any) {
    const establishment = await this.prisma.establishment.findUnique({ where: { id } });
    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    return this.prisma.establishment.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        category: dto.category,
        country: dto.country,
        timezone: dto.timezone,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        logo: dto.logo,
        website: dto.website,
        isActive: dto.isActive,
      },
      include: {
        tenant: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async remove(id: string, permanent = false) {
    const establishment = await this.prisma.establishment.findUnique({ where: { id } });
    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    if (permanent) {
      await this.prisma.establishment.delete({ where: { id } });
      return { message: 'Establishment permanently deleted' };
    }

    // Soft delete / deactivation
    await this.prisma.establishment.update({
      where: { id },
      data: { isActive: false, isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'Establishment deactivated successfully' };
  }

  async restore(id: string) {
    const establishment = await this.prisma.establishment.findUnique({ where: { id } });
    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    return this.prisma.establishment.update({
      where: { id },
      data: { isActive: true, isDeleted: false, deletedAt: null },
      include: {
        tenant: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async getPaymentConfig(establishmentId: string, user?: any) {
    let config = await this.prisma.paymentConfig.findFirst({
      where: { establishmentId },
    });

    if (!config) {
      config = await this.prisma.paymentConfig.create({
        data: {
          establishmentId,
          allowedMethods: ['CASH', 'CHECK', 'BANK_TRANSFER'],
          stripeEnabled: false,
          clicToPayEnabled: false,
          clicToPayTestMode: true,
        },
      });
    }

    const isRoot = user?.isRoot || user?.role === 'ROOT';

    return {
      ...config,
      stripePublishableKey: config.stripeKey || '',
      stripeSecretKey: isRoot ? (this.cryptoService.decrypt(config.stripeSecret) || '') : (config.stripeSecret ? '••••••••' : ''),
      stripeSecret: isRoot ? (this.cryptoService.decrypt(config.stripeSecret) || '') : (config.stripeSecret ? '••••••••' : ''),
      stripeWebhookSecret: isRoot ? (this.cryptoService.decrypt(config.stripeWebhookSecret) || '') : (config.stripeWebhookSecret ? '••••••••' : ''),
      clicToPayApiKey: isRoot ? (this.cryptoService.decrypt(config.clicToPayApiKey) || '') : (config.clicToPayApiKey ? '••••••••' : ''),
      clicToPaySecretKey: isRoot ? (this.cryptoService.decrypt(config.clicToPaySecretKey) || '') : (config.clicToPaySecretKey ? '••••••••' : ''),
    };
  }

  async updatePaymentConfig(establishmentId: string, dto: any) {
    const existing = await this.prisma.paymentConfig.findFirst({
      where: { establishmentId },
    });

    const inputStripeSecret = dto.stripeSecret !== undefined ? dto.stripeSecret : dto.stripeSecretKey;
    let resolvedStripeSecret = existing?.stripeSecret;
    if (inputStripeSecret !== undefined) {
      if (inputStripeSecret && !inputStripeSecret.includes('••')) {
        resolvedStripeSecret = this.cryptoService.encrypt(inputStripeSecret) || null;
      } else if (!inputStripeSecret) {
        resolvedStripeSecret = null;
      }
    }

    let resolvedStripeWebhookSecret = existing?.stripeWebhookSecret;
    if (dto.stripeWebhookSecret !== undefined) {
      if (dto.stripeWebhookSecret && !dto.stripeWebhookSecret.includes('••')) {
        resolvedStripeWebhookSecret = this.cryptoService.encrypt(dto.stripeWebhookSecret) || null;
      } else if (!dto.stripeWebhookSecret) {
        resolvedStripeWebhookSecret = null;
      }
    }

    let resolvedClicToPayApiKey = existing?.clicToPayApiKey;
    if (dto.clicToPayApiKey !== undefined) {
      if (dto.clicToPayApiKey && !dto.clicToPayApiKey.includes('••')) {
        resolvedClicToPayApiKey = this.cryptoService.encrypt(dto.clicToPayApiKey) || null;
      } else if (!dto.clicToPayApiKey) {
        resolvedClicToPayApiKey = null;
      }
    }

    let resolvedClicToPaySecretKey = existing?.clicToPaySecretKey;
    if (dto.clicToPaySecretKey !== undefined) {
      if (dto.clicToPaySecretKey && !dto.clicToPaySecretKey.includes('••')) {
        resolvedClicToPaySecretKey = this.cryptoService.encrypt(dto.clicToPaySecretKey) || null;
      } else if (!dto.clicToPaySecretKey) {
        resolvedClicToPaySecretKey = null;
      }
    }

    const resolvedStripeKey = dto.stripeKey !== undefined ? dto.stripeKey : (dto.stripePublishableKey !== undefined ? dto.stripePublishableKey : existing?.stripeKey);

    if (existing) {
      return this.prisma.paymentConfig.update({
        where: { id: existing.id },
        data: {
          allowedMethods: dto.allowedMethods ?? existing.allowedMethods,
          stripeEnabled: dto.stripeEnabled ?? existing.stripeEnabled,
          stripeKey: resolvedStripeKey,
          stripeSecret: resolvedStripeSecret,
          stripeWebhookSecret: resolvedStripeWebhookSecret,
          stripeTestMode: dto.stripeTestMode !== undefined ? dto.stripeTestMode : existing.stripeTestMode,
          stripeCurrency: dto.stripeCurrency !== undefined ? dto.stripeCurrency : existing.stripeCurrency,
          clicToPayEnabled: dto.clicToPayEnabled ?? existing.clicToPayEnabled,
          clicToPayMerchantId: dto.clicToPayMerchantId !== undefined ? dto.clicToPayMerchantId : existing.clicToPayMerchantId,
          clicToPayApiKey: resolvedClicToPayApiKey,
          clicToPaySecretKey: resolvedClicToPaySecretKey,
          clicToPayTerminalId: dto.clicToPayTerminalId !== undefined ? dto.clicToPayTerminalId : existing.clicToPayTerminalId,
          clicToPayTestMode: dto.clicToPayTestMode !== undefined ? dto.clicToPayTestMode : existing.clicToPayTestMode,
          clicToPayCurrency: dto.clicToPayCurrency !== undefined ? dto.clicToPayCurrency : existing.clicToPayCurrency,
          latePenaltyPercent: dto.latePenaltyPercent ?? existing.latePenaltyPercent,
          latePenaltyEnabled: dto.latePenaltyEnabled ?? existing.latePenaltyEnabled,
          blockAccessOnLate: dto.blockAccessOnLate ?? existing.blockAccessOnLate,
        },
      });
    }

    return this.prisma.paymentConfig.create({
      data: {
        establishmentId,
        allowedMethods: dto.allowedMethods || ['CASH', 'CHECK', 'BANK_TRANSFER'],
        stripeEnabled: dto.stripeEnabled ?? false,
        stripeKey: resolvedStripeKey || null,
        stripeSecret: resolvedStripeSecret || null,
        stripeWebhookSecret: resolvedStripeWebhookSecret || null,
        stripeTestMode: dto.stripeTestMode ?? true,
        stripeCurrency: dto.stripeCurrency || 'TND',
        clicToPayEnabled: dto.clicToPayEnabled ?? false,
        clicToPayMerchantId: dto.clicToPayMerchantId || null,
        clicToPayApiKey: resolvedClicToPayApiKey || null,
        clicToPaySecretKey: resolvedClicToPaySecretKey || null,
        clicToPayTerminalId: dto.clicToPayTerminalId || null,
        clicToPayTestMode: dto.clicToPayTestMode ?? true,
        clicToPayCurrency: dto.clicToPayCurrency || 'TND',
      },
    });
  }
}


