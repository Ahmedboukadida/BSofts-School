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
    if (query.includeDeleted) {
      where.isActive = false;
    } else if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    } else {
      where.isActive = true;
    }

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
          features: true,
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
      this.prisma.saaSPlan.count({ where }),
    ]);

    const formatted = data.map((plan) => {
      const maxStudentsFeat = plan.features?.find((f) => f.code === 'maxStudents');
      const maxTeachersFeat = plan.features?.find((f) => f.code === 'maxTeachers');
      const maxStorageGbFeat = plan.features?.find((f) => f.code === 'maxStorageGb');
      return {
        ...plan,
        maxStudents: maxStudentsFeat ? parseInt(maxStudentsFeat.value, 10) : 500,
        maxTeachers: maxTeachersFeat ? parseInt(maxTeachersFeat.value, 10) : 40,
        maxStorageGb: maxStorageGbFeat ? parseInt(maxStorageGbFeat.value, 10) : 50,
      };
    });

    return new PaginatedDto(formatted, total, page, limit);
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

    const maxStudentsFeat = plan.features?.find((f) => f.code === 'maxStudents');
    const maxTeachersFeat = plan.features?.find((f) => f.code === 'maxTeachers');
    const maxStorageGbFeat = plan.features?.find((f) => f.code === 'maxStorageGb');

    return {
      ...plan,
      maxStudents: maxStudentsFeat ? parseInt(maxStudentsFeat.value, 10) : 500,
      maxTeachers: maxTeachersFeat ? parseInt(maxTeachersFeat.value, 10) : 40,
      maxStorageGb: maxStorageGbFeat ? parseInt(maxStorageGbFeat.value, 10) : 50,
    };
  }

  async create(dto: CreateSaaSPlanDto) {
    const existing = await this.prisma.saaSPlan.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Plan name already exists');
    }

    const plan = await this.prisma.saaSPlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'TND',
        interval: dto.interval as any,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    const featureData: { planId: string; code: string; value: string; description?: string }[] = [];
    if (dto.maxStudents) featureData.push({ planId: plan.id, code: 'maxStudents', value: String(dto.maxStudents) });
    if (dto.maxTeachers) featureData.push({ planId: plan.id, code: 'maxTeachers', value: String(dto.maxTeachers) });
    if (dto.maxStorageGb) featureData.push({ planId: plan.id, code: 'maxStorageGb', value: String(dto.maxStorageGb) });

    if (Array.isArray(dto.features)) {
      for (const f of dto.features) {
        if (typeof f === 'string') {
          featureData.push({ planId: plan.id, code: f, value: 'true' });
        } else if (f && f.code) {
          featureData.push({
            planId: plan.id,
            code: f.code,
            value: String(f.included ?? f.value ?? 'true'),
            description: f.name || f.description,
          });
        }
      }
    }

    if (featureData.length > 0) {
      await this.prisma.saaSPlanFeature.createMany({ data: featureData });
    }

    return this.findOne(plan.id);
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

    await this.prisma.saaSPlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price !== undefined ? dto.price : undefined,
        currency: dto.currency,
        interval: dto.interval as any,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : undefined,
      },
    });

    if (dto.maxStudents !== undefined || dto.maxTeachers !== undefined || dto.maxStorageGb !== undefined || dto.features !== undefined) {
      await this.prisma.saaSPlanFeature.deleteMany({ where: { planId: id } });
      const featureData: { planId: string; code: string; value: string; description?: string }[] = [];
      if (dto.maxStudents) featureData.push({ planId: id, code: 'maxStudents', value: String(dto.maxStudents) });
      if (dto.maxTeachers) featureData.push({ planId: id, code: 'maxTeachers', value: String(dto.maxTeachers) });
      if (dto.maxStorageGb) featureData.push({ planId: id, code: 'maxStorageGb', value: String(dto.maxStorageGb) });

      if (Array.isArray(dto.features)) {
        for (const f of dto.features) {
          if (typeof f === 'string') {
            featureData.push({ planId: id, code: f, value: 'true' });
          } else if (f && f.code) {
            featureData.push({
              planId: id,
              code: f.code,
              value: String(f.included ?? f.value ?? 'true'),
              description: f.name || f.description,
            });
          }
        }
      }

      if (featureData.length > 0) {
        await this.prisma.saaSPlanFeature.createMany({ data: featureData });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, permanent: boolean = false) {
    const plan = await this.prisma.saaSPlan.findUnique({
      where: { id },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException(`SaaS Plan with ID ${id} not found`);
    }

    if (permanent) {
      if (plan._count.subscriptions > 0) {
        throw new ConflictException('Impossible de supprimer définitivement un forfait avec des abonnements existants.');
      }
      await this.prisma.saaSPlanFeature.deleteMany({ where: { planId: id } });
      await this.prisma.saaSPlanModule.deleteMany({ where: { planId: id } });
      await this.prisma.saaSPlan.delete({ where: { id } });
      return { message: 'Forfait supprimé définitivement avec succès' };
    }

    await this.prisma.saaSPlan.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Forfait archivé et déplacé dans la corbeille' };
  }

  async restore(id: string) {
    const plan = await this.prisma.saaSPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`SaaS Plan with ID ${id} not found`);
    }

    await this.prisma.saaSPlan.update({
      where: { id },
      data: { isActive: true },
    });
    return { message: 'Forfait restauré avec succès' };
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
