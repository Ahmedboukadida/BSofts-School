import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherPaymentDto, UpdateTeacherPaymentStatusDto, QueryTeacherPaymentDto } from './teacher-payment.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class TeacherPaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTeacherPaymentDto) {
    const { page = 1, limit = 10, teacherId, contractId, status, period, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (contractId) where.contractId = contractId;
    if (status) where.status = status;
    if (period) where.period = period;

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.teacherPayment.findMany({
        where, skip, take: limit, orderBy,
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          contract: { select: { id: true, contractType: true, salary: true } },
        },
      }),
      this.prisma.teacherPayment.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const payment = await this.prisma.teacherPayment.findUnique({
      where: { id },
      include: { teacher: true, contract: true },
    });
    if (!payment) throw new NotFoundException(`Teacher Payment with ID ${id} not found`);
    return payment;
  }

  async create(dto: CreateTeacherPaymentDto) {
    return this.prisma.teacherPayment.create({
      data: {
        teacherId: dto.teacherId,
        contractId: dto.contractId,
        period: dto.period,
        amount: dto.amount,
        currency: dto.currency,
        hoursWorked: dto.hoursWorked,
        calculatedAmount: dto.calculatedAmount,
        notes: dto.notes,
        createdBy: dto.createdBy,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateTeacherPaymentStatusDto) {
    const payment = await this.prisma.teacherPayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Teacher Payment with ID ${id} not found`);

    return this.prisma.teacherPayment.update({
      where: { id },
      data: {
        status: dto.status as any,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : dto.status === 'PAID' ? new Date() : undefined,
        notes: dto.notes,
      },
    });
  }

  async getTeacherPayments(teacherId: string) {
    return this.prisma.teacherPayment.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: { contract: { select: { id: true, contractType: true } } },
    });
  }

  async generateMonthlyPayroll(period: string, establishmentId?: string, user?: any) {
    const contracts = await this.prisma.teacherContract.findMany({
      where: {
        isActive: true,
        ...(establishmentId ? { teacher: { establishmentId } } : {}),
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const generated = [];

    for (const contract of contracts) {
      let amount = Number(contract.salary) || 0;
      let hoursWorked: number | undefined = undefined;

      if (contract.contractType === 'HOURLY') {
        const parts = period.split('-');
        const year = parseInt(parts[0], 10) || new Date().getFullYear();
        const month = parseInt(parts[1], 10) || new Date().getMonth() + 1;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const sessions = await this.prisma.session.findMany({
          where: {
            teacherId: contract.teacherId,
            date: { gte: startDate, lte: endDate },
            status: { not: 'CANCELLED' },
          },
        });

        hoursWorked = sessions.length * 2;
        amount = hoursWorked * (Number(contract.hourlyRate) || 35);
      }

      const existing = await this.prisma.teacherPayment.findFirst({
        where: { teacherId: contract.teacherId, period },
      });

      if (existing) {
        const updated = await this.prisma.teacherPayment.update({
          where: { id: existing.id },
          data: {
            amount,
            calculatedAmount: amount,
            hoursWorked,
            contractId: contract.id,
          },
        });
        generated.push(updated);
      } else {
        const created = await this.prisma.teacherPayment.create({
          data: {
            teacherId: contract.teacherId,
            contractId: contract.id,
            period,
            amount,
            calculatedAmount: amount,
            hoursWorked,
            currency: 'TND',
            status: 'PENDING',
            notes: `Fiche de paie générée pour ${period}`,
            createdBy: user?.userId,
          },
        });
        generated.push(created);
      }
    }

    return {
      message: `${generated.length} fiches de paie générées pour la période ${period}`,
      count: generated.length,
      payments: generated,
    };
  }

  async remove(id: string) {
    const payment = await this.prisma.teacherPayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Teacher Payment with ID ${id} not found`);
    await this.prisma.teacherPayment.update({ where: { id }, data: { status: 'CANCELLED' } });
    return { message: 'Teacher Payment cancelled' };
  }
}
