import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto, QueryPaymentPlanDto } from './payment-plan.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class PaymentPlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPaymentPlanDto) {
    const { page = 1, limit = 10, search, establishmentId, classLevelId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (classLevelId) where.classLevelId = classLevelId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.paymentPlan.findMany({
        where, skip, take: limit, orderBy,
        include: {
          _count: { select: { payments: true } },
        },
      }),
      this.prisma.paymentPlan.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { student: { select: { id: true, firstName: true, lastName: true } } },
        },
        _count: { select: { payments: true } },
      },
    });
    if (!plan) throw new NotFoundException(`PaymentPlan with ID ${id} not found`);
    return plan;
  }

  async create(dto: CreatePaymentPlanDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required');
    }

    return this.prisma.paymentPlan.create({
      data: {
        establishmentId,
        name: dto.name,
        description: dto.description,
        classLevelId: dto.classLevelId,
        classId: dto.classId,
        type: dto.type as any,
        amount: dto.amount,
        currency: dto.currency ?? 'DZD',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        recurringPeriod: dto.recurringPeriod as any,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdatePaymentPlanDto) {
    const plan = await this.prisma.paymentPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`PaymentPlan with ID ${id} not found`);

    return this.prisma.paymentPlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        classLevelId: dto.classLevelId,
        classId: dto.classId,
        type: dto.type as any,
        amount: dto.amount,
        currency: dto.currency,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        recurringPeriod: dto.recurringPeriod as any,
        isActive: dto.isActive,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    const plan = await this.prisma.paymentPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`PaymentPlan with ID ${id} not found`);
    await this.prisma.paymentPlan.update({ where: { id }, data: { isActive: false } });
    return { message: 'PaymentPlan deactivated successfully' };
  }
}
