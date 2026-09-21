import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedDto } from '../common/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.includeDeleted) {
      where.user = { isActive: false };
    } else if (query.isActive !== undefined) {
      const activeVal = typeof query.isActive === 'string' ? query.isActive === 'true' : Boolean(query.isActive);
      where.user = { isActive: activeVal };
    }

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, username: true, isActive: true },
          },
          establishments: {
            select: { id: true, name: true, slug: true, category: true, isActive: true },
          },
          subscriptions: {
            take: 1,
            include: {
              plan: { select: { id: true, name: true, price: true } },
            },
          },
          settings: true,
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, username: true, isActive: true },
        },
        establishments: {
          select: { id: true, name: true, isActive: true },
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: {
            plan: { select: { id: true, name: true, price: true } },
          },
        },
        settings: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async create(dto: any) {
    let targetUserId = typeof dto === 'string' ? dto : dto.userId;

    if (!targetUserId) {
      const email = dto.ownerEmail || dto.email;
      if (!email) {
        throw new BadRequestException('userId or email is required to create a tenant');
      }
      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        const rawPassword = 'Password123!';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        const nameParts = (dto.ownerName || dto.name || 'Tenant Admin').trim().split(' ');
        const firstName = nameParts[0] || 'Admin';
        const lastName = nameParts.slice(1).join(' ') || 'Tenant';
        const baseUsername = (dto.slug || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
        let username = baseUsername;
        let count = 1;
        while (await this.prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${count++}`;
        }
        user = await this.prisma.user.create({
          data: {
            email,
            username,
            password: hashedPassword,
            firstName,
            lastName,
            isActive: true,
          },
        });
      }
      targetUserId = user.id;
    }

    const existingTenant = await this.prisma.tenant.findUnique({ where: { userId: targetUserId } });
    if (existingTenant) {
      throw new ConflictException('A tenant already exists for this user');
    }

    const tenant = await this.prisma.tenant.create({
      data: { userId: targetUserId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, username: true, isActive: true } },
      },
    });

    // Create subscription if plan specified
    if (dto.activePlanName || dto.planId) {
      const plan = dto.planId
        ? await this.prisma.saaSPlan.findUnique({ where: { id: dto.planId } })
        : await this.prisma.saaSPlan.findFirst({ where: { name: dto.activePlanName } });
      if (plan) {
        await this.prisma.tenantSubscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: 'ACTIVE',
            startDate: new Date(),
          },
        });
      }
    }

    return this.findOne(tenant.id);
  }

  async update(id: string, dto: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { user: true, settings: true },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    if (dto.ownerName || dto.ownerEmail || dto.name || dto.isActive !== undefined) {
      const userUpdate: any = {};
      if (dto.ownerName) {
        const parts = dto.ownerName.trim().split(' ');
        userUpdate.firstName = parts[0];
        userUpdate.lastName = parts.slice(1).join(' ') || parts[0];
      }
      if (dto.ownerEmail && dto.ownerEmail !== tenant.user.email) {
        userUpdate.email = dto.ownerEmail;
      }
      if (dto.isActive !== undefined) {
        userUpdate.isActive = Boolean(dto.isActive);
      }
      if (Object.keys(userUpdate).length > 0) {
        await this.prisma.user.update({
          where: { id: tenant.userId },
          data: userUpdate,
        });
      }
    }

    return this.findOne(id);
  }

  async restore(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: tenant.userId },
      data: { isActive: true },
    });

    return this.findOne(id);
  }

  async remove(id: string, permanent = false) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    if (permanent) {
      await this.prisma.tenantPlanFeatureOverride.deleteMany({ where: { tenantId: id } });
      await this.prisma.tenantSubscription.deleteMany({ where: { tenantId: id } });
      await this.prisma.tenantSettings.deleteMany({ where: { tenantId: id } });
      await this.prisma.tenant.delete({ where: { id } });
      return { message: 'Tenant permanently deleted' };
    }

    await this.prisma.user.update({
      where: { id: tenant.userId },
      data: { isActive: false },
    });
    return { message: 'Tenant deactivated successfully' };
  }
}

