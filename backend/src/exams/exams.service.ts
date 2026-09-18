import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, UpdateExamDto, QueryExamDto } from './exam.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { ExamEntity } from './exam.entity';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryExamDto) {
    const { page = 1, limit = 10, search, establishmentId, classId, periodId, type, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (classId) where.classId = classId;
    if (periodId) where.periodId = periodId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { startTime: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({
        where, skip, take: limit, orderBy,
        include: {
          class: { select: { id: true, name: true } },
          matiere: { select: { id: true, name: true } },
          period: { select: { id: true, name: true } },
          _count: { select: { questions: true, submissions: true } },
        },
      }),
      this.prisma.exam.count({ where }),
    ]);

    const entities = data.map((item) => new ExamEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        class: true,
        matiere: true,
        period: true,
        academicYear: { select: { id: true, name: true } },
        questions: { orderBy: { sortOrder: 'asc' } },
        submissions: { take: 5 },
        _count: { select: { questions: true, submissions: true } },
      },
    });
    if (!exam) throw new NotFoundException(`Exam with ID ${id} not found`);
    return new ExamEntity(exam as any);
  }

  async create(dto: CreateExamDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    try {
      const created = await this.prisma.exam.create({
        data: {
          establishmentId,
          classId: dto.classId,
          periodId: dto.periodId || null,
          academicYearId: dto.academicYearId || null,
          matiereId: dto.matiereId || null,
          title: dto.title,
          description: dto.description,
          type: dto.type as any,
          isOnline: dto.isOnline ?? false,
          maxScore: dto.maxScore ?? 20,
          duration: dto.duration,
          startTime: dto.startTime ? new Date(dto.startTime) : null,
          endTime: dto.endTime ? new Date(dto.endTime) : null,
          antiCheat: dto.antiCheat ?? false,
          createdBy: user?.id || null,
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
          entity: 'Exam',
          entityId: created.id,
          status: 'SUCCESS',
          newValues: created as any,
        },
      });

      return new ExamEntity(created as any);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to create exam: ${err.message}`,
          stack: err.stack,
          context: 'ExamsService.create',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async update(id: string, dto: UpdateExamDto, user?: any) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException(`Exam with ID ${id} not found`);

    try {
      const updated = await this.prisma.exam.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status as any,
          startTime: dto.startTime ? new Date(dto.startTime) : undefined,
          endTime: dto.endTime ? new Date(dto.endTime) : undefined,
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
          entity: 'Exam',
          entityId: id,
          status: 'SUCCESS',
          oldValues: exam as any,
          newValues: updated as any,
        },
      });

      return new ExamEntity(updated as any);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to update exam ${id}: ${err.message}`,
          stack: err.stack,
          context: 'ExamsService.update',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async remove(id: string, isPermanent: boolean = false, user?: any) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException(`Exam with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
      : 'System';

    if (isPermanent) {
      const isRoot = user?.role === 'ROOT' || user?.isRoot === true;
      if (!isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.exam.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Exam',
            entityId: id,
            status: 'SUCCESS',
            oldValues: exam as any,
          },
        });
        return { message: 'Exam permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Exam ${id}: ${err.message}`,
            stack: err.stack,
            context: 'ExamsService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete exam. Dependent records exist: ${err.message}`);
      }
    }

    try {
      await this.prisma.exam.delete({ where: { id } });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'DELETE',
          entity: 'Exam',
          entityId: id,
          status: 'SUCCESS',
          oldValues: exam as any,
        },
      });
      return { message: 'Exam deleted successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed delete of Exam ${id}: ${err.message}`,
          stack: err.stack,
          context: 'ExamsService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
