import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaaSPlanDto, UpdateSaaSPlanDto, QuerySaaSPlanDto } from './saas-plan.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class SaaSPlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySaaSPlanDto) {
    const { page = 1, limit = 10, search, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.sortOrder = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.saaSPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          modules: {
            include: {
              module: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
      this.prisma.saaSPlan.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const plan = await this.prisma.saaSPlan.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            module: true,
          },
        },
        features: true,
        subscriptions: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            tenant: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`SaaS Plan with ID ${id} not found`);
    }

    return plan;
  }

  async create(dto: CreateSaaSPlanDto) {
    const existing = await this.prisma.saaSPlan.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Plan name already exists');
    }

    return this.prisma.saaSPlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency,
        interval: dto.interval as any,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateSaaSPlanDto) {
    const plan = await this.prisma.saaSPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`SaaS Plan with ID ${id} not found`);
    }

    if (dto.name && dto.name !== plan.name) {
      const existing = await this.prisma.saaSPlan.findUnique({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('Plan name already exists');
      }
    }

    return this.prisma.saaSPlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        interval: dto.interval as any,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: string) {
    const plan = await this.prisma.saaSPlan.findUnique({
      where: { id },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException(`SaaS Plan with ID ${id} not found`);
    }

    if (plan._count.subscriptions > 0) {
      throw new ConflictException('Cannot delete plan with active subscriptions');
    }

    await this.prisma.saaSPlan.delete({ where: { id } });
    return { message: 'Plan deleted successfully' };
  }

  async assignModules(planId: string, moduleIds: string[]) {
    const plan = await this.prisma.saaSPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Plan with ID ${planId} not found`);

    // Remove existing
    await this.prisma.saaSPlanModule.deleteMany({ where: { planId } });

    // Add new
    await this.prisma.saaSPlanModule.createMany({
      data: moduleIds.map((moduleId) => ({ planId, moduleId })),
    });

    return { message: 'Modules assigned successfully' };
  }
}
