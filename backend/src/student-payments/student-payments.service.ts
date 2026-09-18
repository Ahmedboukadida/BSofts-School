import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentPaymentDto, UpdatePaymentStatusDto, QueryStudentPaymentDto } from './student-payment.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { StudentPaymentEntity } from './student-payment.entity';

@Injectable()
export class StudentPaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryStudentPaymentDto) {
    const { page = 1, limit = 10, search, studentId, parentId, status, method, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (parentId) where.parentId = parentId;
    if (status) where.status = status;
    if (method) where.method = method;
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.studentPayment.findMany({
        where, skip, take: limit, orderBy,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
          parent: { select: { id: true, firstName: true, lastName: true } },
          plan: { select: { id: true, name: true } },
        },
      }),
      this.prisma.studentPayment.count({ where }),
    ]);

    const entities = data.map((item) => new StudentPaymentEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const payment = await this.prisma.studentPayment.findUnique({
      where: { id },
      include: { student: true, parent: true, plan: true },
    });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return new StudentPaymentEntity(payment as any);
  }

  async create(dto: CreateStudentPaymentDto, user?: any) {
    try {
      const created = await this.prisma.studentPayment.create({
        data: {
          studentId: dto.studentId,
          parentId: dto.parentId,
          planId: dto.planId,
          amount: dto.amount,
          currency: dto.currency || 'TND',
          method: dto.method as any,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          reference: dto.reference,
          notes: dto.notes,
          createdBy: user?.username || dto.createdBy,
        },
      });

      const actorSnapshot = user
        ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
        : 'System';

      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'CREATE',
          entity: 'StudentPayment',
          entityId: created.id,
          status: 'SUCCESS',
          newValues: created as any,
        },
      });

      return new StudentPaymentEntity(created as any);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to create student payment: ${err.message}`,
          stack: err.stack,
          context: 'StudentPaymentsService.create',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async updateStatus(id: string, dto: UpdatePaymentStatusDto, user?: any) {
    const payment = await this.prisma.studentPayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);

    try {
      const updated = await this.prisma.studentPayment.update({
        where: { id },
        data: {
          status: dto.status as any,
          paidAt: dto.paidAt ? new Date(dto.paidAt) : dto.status === 'PAID' ? new Date() : undefined,
          reference: dto.reference,
          stripePaymentId: dto.stripePaymentId,
          paypalPaymentId: dto.paypalPaymentId,
        },
      });

      const actorSnapshot = user
        ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
        : 'System';

      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'UPDATE_STATUS',
          entity: 'StudentPayment',
          entityId: id,
          status: 'SUCCESS',
          oldValues: payment as any,
          newValues: updated as any,
        },
      });

      return new StudentPaymentEntity(updated as any);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to update status for payment ${id}: ${err.message}`,
          stack: err.stack,
          context: 'StudentPaymentsService.updateStatus',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async update(id: string, dto: { amount?: number; method?: string; status?: string; notes?: string }, user?: any) {
    const payment = await this.prisma.studentPayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);

    try {
      const updated = await this.prisma.studentPayment.update({
        where: { id },
        data: {
          amount: dto.amount !== undefined ? dto.amount : undefined,
          method: dto.method ? (dto.method as any) : undefined,
          status: dto.status ? (dto.status as any) : undefined,
          notes: dto.notes !== undefined ? dto.notes : undefined,
        },
      });

      const actorSnapshot = user
        ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
        : 'System';

      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'UPDATE',
          entity: 'StudentPayment',
          entityId: id,
          status: 'SUCCESS',
          oldValues: payment as any,
          newValues: updated as any,
        },
      });

      return new StudentPaymentEntity(updated as any);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to update payment ${id}: ${err.message}`,
          stack: err.stack,
          context: 'StudentPaymentsService.update',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async getStudentPayments(studentId: string) {
    const list = await this.prisma.studentPayment.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: { plan: { select: { id: true, name: true } } },
    });
    return list.map((item) => new StudentPaymentEntity(item as any));
  }

  async remove(id: string, isPermanent: boolean = false, user?: any) {
    const payment = await this.prisma.studentPayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
      : 'System';

    if (isPermanent) {
      const isRoot = user?.role === 'ROOT' || user?.isRoot === true;
      if (!isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.studentPayment.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'StudentPayment',
            entityId: id,
            status: 'SUCCESS',
            oldValues: payment as any,
          },
        });
        return { message: 'Student payment permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of StudentPayment ${id}: ${err.message}`,
            stack: err.stack,
            context: 'StudentPaymentsService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete payment: ${err.message}`);
      }
    }

    try {
      const updated = await this.prisma.studentPayment.update({ where: { id }, data: { status: 'CANCELLED' } });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'CANCEL_PAYMENT',
          entity: 'StudentPayment',
          entityId: id,
          status: 'SUCCESS',
          oldValues: payment as any,
          newValues: updated as any,
        },
      });
      return { message: 'Payment cancelled successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to cancel payment ${id}: ${err.message}`,
          stack: err.stack,
          context: 'StudentPaymentsService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
