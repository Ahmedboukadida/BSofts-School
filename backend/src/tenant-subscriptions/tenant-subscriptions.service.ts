import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantSubscriptionDto, UpdateTenantSubscriptionDto, QueryTenantSubscriptionDto } from './tenant-subscription.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class TenantSubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTenantSubscriptionDto) {
    const { page = 1, limit = 10, search, tenantId, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.includeDeleted) {
      where.status = { in: ['CANCELLED', 'EXPIRED'] };
    } else if (status) {
      where.status = status;
    }
    if (tenantId) where.tenantId = tenantId;
    if (search) {
      where.OR = [
        { tenant: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { tenant: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
        { plan: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.tenantSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tenant: {
            select: {
              id: true,
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          plan: {
            select: { id: true, name: true, price: true, currency: true, interval: true },
          },
        },
      }),
      this.prisma.tenantSubscription.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { id },
      include: {
        tenant: true,
        plan: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async create(dto: CreateTenantSubscriptionDto) {
    // Check tenant exists
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException(`Tenant with ID ${dto.tenantId} not found`);

    // Check plan exists
    const plan = await this.prisma.saaSPlan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException(`Plan with ID ${dto.planId} not found`);

    // Check for active subscription
    const existing = await this.prisma.tenantSubscription.findFirst({
      where: {
        tenantId: dto.tenantId,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      throw new ConflictException('Tenant already has an active subscription');
    }

    return this.prisma.tenantSubscription.create({
      data: {
        tenantId: dto.tenantId,
        planId: dto.planId,
        status: (dto.status as any) || 'ACTIVE',
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: {
        tenant: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        plan: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, dto: UpdateTenantSubscriptionDto) {
    const subscription = await this.prisma.tenantSubscription.findUnique({ where: { id } });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return this.prisma.tenantSubscription.update({
      where: { id },
      data: {
        planId: dto.planId,
        status: dto.status as any,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        tenant: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        plan: { select: { id: true, name: true } },
      },
    });
  }

  async cancel(id: string) {
    const subscription = await this.prisma.tenantSubscription.findUnique({ where: { id } });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return this.prisma.tenantSubscription.update({
      where: { id },
      data: { status: 'CANCELLED', endDate: new Date() },
    });
  }

  async approve(id: string, approvedBy?: string) {
    const subscription = await this.prisma.tenantSubscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException(`Subscription with ID ${id} not found`);

    return this.prisma.tenantSubscription.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        tenant: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        plan: { select: { id: true, name: true, price: true, currency: true } },
      },
    });
  }

  async renew(id: string, months: number = 12, newEndDate?: string) {
    const subscription = await this.prisma.tenantSubscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException(`Subscription with ID ${id} not found`);

    let end: Date;
    if (newEndDate) {
      end = new Date(newEndDate);
    } else {
      end = subscription.endDate ? new Date(subscription.endDate) : new Date();
      end.setMonth(end.getMonth() + months);
    }

    return this.prisma.tenantSubscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        endDate: end,
      },
      include: {
        tenant: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        plan: { select: { id: true, name: true, price: true, currency: true } },
      },
    });
  }

  async remove(id: string, permanent: boolean = false) {
    const subscription = await this.prisma.tenantSubscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException(`Subscription with ID ${id} not found`);

    if (permanent) {
      await this.prisma.tenantSubscription.delete({ where: { id } });
      return { message: 'Abonnement supprimé définitivement' };
    }

    await this.prisma.tenantSubscription.update({
      where: { id },
      data: { status: 'CANCELLED', endDate: new Date() },
    });
    return { message: 'Abonnement résilié et déplacé dans la corbeille' };
  }

  async restore(id: string) {
    const subscription = await this.prisma.tenantSubscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException(`Subscription with ID ${id} not found`);

    await this.prisma.tenantSubscription.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    return { message: 'Abonnement réactivé avec succès' };
  }

  async getTenantSubscription(tenantId: string) {
    return this.prisma.tenantSubscription.findFirst({
      where: { tenantId, status: 'ACTIVE' },
      include: {
        plan: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });
  }
}
