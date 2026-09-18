import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkTeacherAttendanceDto, QueryTeacherAttendanceDto } from './teacher-attendance.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { TeacherAttendanceEntity } from './teacher-attendance.entity';

@Injectable()
export class TeacherAttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTeacherAttendanceDto) {
    const { page = 1, limit = 10, teacherId, startDate, endDate, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { date: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.teacherAttendance.findMany({
        where, skip, take: limit, orderBy,
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.teacherAttendance.count({ where }),
    ]);

    const entities = data.map((item) => new TeacherAttendanceEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async mark(dto: MarkTeacherAttendanceDto, user?: any) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const existing = await this.prisma.teacherAttendance.findUnique({
      where: { teacherId_date: { teacherId: dto.teacherId, date } },
    });

    try {
      let record;
      if (existing) {
        record = await this.prisma.teacherAttendance.update({
          where: { id: existing.id },
          data: {
            checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
            checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
            status: dto.status as any,
            source: dto.source as any,
            markedBy: dto.markedBy || user?.username,
          },
        });
      } else {
        record = await this.prisma.teacherAttendance.create({
          data: {
            teacherId: dto.teacherId,
            date,
            checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
            checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
            status: dto.status as any,
            source: (dto.source as any) || 'MANUAL',
            markedBy: dto.markedBy || user?.username,
          },
        });
      }

      const actorSnapshot = user
        ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
        : 'System';

      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: existing ? 'UPDATE' : 'CREATE',
          entity: 'TeacherAttendance',
          entityId: record.id,
          status: 'SUCCESS',
          oldValues: existing as any,
          newValues: record as any,
        },
      });

      return new TeacherAttendanceEntity(record as any);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to mark teacher attendance: ${err.message}`,
          stack: err.stack,
          context: 'TeacherAttendanceService.mark',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async getStats(teacherId: string, startDate?: string, endDate?: string) {
    const where: any = { teacherId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [total, present, absent, late, excused] = await Promise.all([
      this.prisma.teacherAttendance.count({ where }),
      this.prisma.teacherAttendance.count({ where: { ...where, status: 'PRESENT' } }),
      this.prisma.teacherAttendance.count({ where: { ...where, status: 'ABSENT' } }),
      this.prisma.teacherAttendance.count({ where: { ...where, status: 'LATE' } }),
      this.prisma.teacherAttendance.count({ where: { ...where, status: 'EXCUSED' } }),
    ]);

    return { total, present, absent, late, excused, rate: total > 0 ? (present / total) * 100 : 0 };
  }

  async remove(id: string, isPermanent: boolean = false, user?: any) {
    const attendance = await this.prisma.teacherAttendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException(`Attendance with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
      : 'System';

    try {
      await this.prisma.teacherAttendance.delete({ where: { id } });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: isPermanent ? 'PERMANENT_DELETE' : 'DELETE',
          entity: 'TeacherAttendance',
          entityId: id,
          status: 'SUCCESS',
          oldValues: attendance as any,
        },
      });
      return { message: 'Attendance record deleted' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to delete teacher attendance ${id}: ${err.message}`,
          stack: err.stack,
          context: 'TeacherAttendanceService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
