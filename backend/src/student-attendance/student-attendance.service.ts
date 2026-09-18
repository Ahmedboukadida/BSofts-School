import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkStudentAttendanceDto, BulkMarkAttendanceDto, QueryStudentAttendanceDto } from './student-attendance.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { StudentAttendanceEntity } from './student-attendance.entity';

@Injectable()
export class StudentAttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryStudentAttendanceDto) {
    const { page = 1, limit = 10, studentId, sessionId, classId, startDate, endDate, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (sessionId) where.sessionId = sessionId;
    if (classId) where.session = { classId };
    if (startDate || endDate) {
      where.session = { ...where.session, date: {} };
      if (startDate) where.session.date.gte = new Date(startDate);
      if (endDate) where.session.date.lte = new Date(endDate);
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.studentAttendance.findMany({
        where, skip, take: limit, orderBy,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
          session: { select: { id: true, date: true, topic: true, class: { select: { id: true, name: true } } } },
        },
      }),
      this.prisma.studentAttendance.count({ where }),
    ]);

    const entities = data.map((item) => new StudentAttendanceEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const attendance = await this.prisma.studentAttendance.findUnique({
      where: { id },
      include: {
        student: true,
        session: { include: { class: true } },
      },
    });
    if (!attendance) throw new NotFoundException(`Attendance with ID ${id} not found`);
    return new StudentAttendanceEntity(attendance as any);
  }

  async mark(dto: MarkStudentAttendanceDto, tx?: any, user?: any) {
    const client = tx || this.prisma;
    const existing = await client.studentAttendance.findUnique({
      where: { studentId_sessionId: { studentId: dto.studentId, sessionId: dto.sessionId } },
    });

    try {
      let record;
      if (existing) {
        record = await client.studentAttendance.update({
          where: { id: existing.id },
          data: { status: dto.status as any, reason: dto.reason, markedBy: dto.markedBy || user?.username },
        });
      } else {
        record = await client.studentAttendance.create({
          data: {
            studentId: dto.studentId,
            sessionId: dto.sessionId,
            status: dto.status as any,
            reason: dto.reason,
            markedBy: dto.markedBy || user?.username,
          },
        });
      }

      if (dto.status === 'ABSENT') {
        this.notifyParentsOfAbsence(dto.studentId, dto.sessionId).catch((err) =>
          console.warn('Failed to dispatch parent absence alert:', err?.message),
        );
      }

      const actorSnapshot = user
        ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
        : 'System';

      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: existing ? 'UPDATE' : 'CREATE',
          entity: 'StudentAttendance',
          entityId: record.id,
          status: 'SUCCESS',
          oldValues: existing as any,
          newValues: record as any,
        },
      });

      return new StudentAttendanceEntity(record as any);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to mark student attendance: ${err.message}`,
          stack: err.stack,
          context: 'StudentAttendanceService.mark',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  private async notifyParentsOfAbsence(studentId: string, sessionId: string) {
    try {
      const [student, session] = await Promise.all([
        this.prisma.student.findUnique({
          where: { id: studentId },
          include: {
            parents: {
              include: {
                parent: {
                  include: { user: true },
                },
              },
            },
          },
        }),
        this.prisma.session.findUnique({
          where: { id: sessionId },
          include: {
            class: true,
            lessons: { take: 1, include: { matiere: true } },
          },
        }),
      ]);

      if (!student || !student.parents || student.parents.length === 0) return;

      const courseName = session?.lessons?.[0]?.matiere?.name || session?.topic || 'Cours';
      const className = session?.class?.name || '';
      const sessionDate = session?.date ? new Date(session.date).toLocaleDateString('fr-FR') : "Aujourd'hui";

      for (const sp of student.parents) {
        const parentUser = sp.parent?.user;
        if (parentUser) {
          await this.prisma.notification.create({
            data: {
              userId: parentUser.id,
              title: `Alerte Absence: ${student.firstName} ${student.lastName}`,
              content: `Votre enfant ${student.firstName} a été noté(e) absent(e) au cours de ${courseName} (${className}) le ${sessionDate}.`,
              type: 'IN_APP',
              link: '/attendance',
            },
          });
        }
      }
    } catch (error) {
      console.warn('Error sending absence notification:', error);
    }
  }

  async bulkMark(dto: BulkMarkAttendanceDto, user?: any) {
    let targetSessionId = dto.sessionId;

    if (!targetSessionId && dto.classId) {
      const targetDate = dto.date ? new Date(dto.date) : new Date();
      targetDate.setHours(8, 0, 0, 0);

      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existingSession = await this.prisma.session.findFirst({
        where: {
          classId: dto.classId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (existingSession) {
        targetSessionId = existingSession.id;
      } else {
        const cls = await this.prisma.class.findUnique({
          where: { id: dto.classId },
          select: { academicYearId: true },
        });
        const currentYear = cls?.academicYearId
          ? { id: cls.academicYearId }
          : (await this.prisma.academicYear.findFirst({ where: { isCurrent: true } })) || (await this.prisma.academicYear.findFirst());
        const currentPeriod = await this.prisma.academicPeriod.findFirst({ orderBy: { createdAt: 'asc' } });

        if (!currentYear?.id || !currentPeriod?.id) {
          throw new BadRequestException('Année scolaire ou période académique requise pour créer une session');
        }

        const newSession = await this.prisma.session.create({
          data: {
            classId: dto.classId,
            academicYearId: currentYear.id,
            periodId: currentPeriod.id,
            date: targetDate,
            startTime: targetDate,
            endTime: new Date(targetDate.getTime() + 2 * 3600 * 1000),
            topic: 'Appel Quotidien',
            status: 'COMPLETED',
          },
        });
        targetSessionId = newSession.id;
      }
    }

    if (!targetSessionId) {
      throw new BadRequestException('sessionId ou classId est requis pour enregistrer la feuille d’appel');
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const batch = [];
      for (const att of dto.attendances) {
        const result = await this.mark({
          studentId: att.studentId,
          sessionId: targetSessionId,
          status: att.status,
          reason: att.reason,
          markedBy: dto.markedBy,
        }, tx, user);
        batch.push(result);
      }
      return batch;
    });
    return { message: `${results.length} attendance records marked`, data: results };
  }

  async getStats(studentId: string, academicYearId?: string) {
    const where: any = { studentId };
    if (academicYearId) {
      where.session = { academicYearId };
    }

    const [total, present, absent, late, excused] = await Promise.all([
      this.prisma.studentAttendance.count({ where }),
      this.prisma.studentAttendance.count({ where: { ...where, status: 'PRESENT' } }),
      this.prisma.studentAttendance.count({ where: { ...where, status: 'ABSENT' } }),
      this.prisma.studentAttendance.count({ where: { ...where, status: 'LATE' } }),
      this.prisma.studentAttendance.count({ where: { ...where, status: 'EXCUSED' } }),
    ]);

    return { total, present, absent, late, excused, rate: total > 0 ? (present / total) * 100 : 0 };
  }

  async remove(id: string, isPermanent: boolean = false, user?: any) {
    const attendance = await this.prisma.studentAttendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException(`Attendance with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
      : 'System';

    try {
      await this.prisma.studentAttendance.delete({ where: { id } });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: isPermanent ? 'PERMANENT_DELETE' : 'DELETE',
          entity: 'StudentAttendance',
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
          message: `Failed to delete attendance ${id}: ${err.message}`,
          stack: err.stack,
          context: 'StudentAttendanceService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
