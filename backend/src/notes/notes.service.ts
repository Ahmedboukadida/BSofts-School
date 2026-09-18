import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto, QueryNoteDto, BulkSaveNotesDto } from './note.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryNoteDto) {
    const { page = 1, limit = 10, studentId, matiereId, periodId, academicYearId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (matiereId) where.matiereId = matiereId;
    if (periodId) where.periodId = periodId;
    if (academicYearId) where.academicYearId = academicYearId;

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.note.findMany({
        where, skip, take: limit, orderBy,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
          matiere: { select: { id: true, name: true, coefficient: true } },
          period: { select: { id: true, name: true } },
        },
      }),
      this.prisma.note.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: { student: true, matiere: true, period: true, exam: true },
    });
    if (!note) throw new NotFoundException(`Note with ID ${id} not found`);
    return note;
  }

  async create(dto: CreateNoteDto) {
    const existing = await this.prisma.note.findFirst({
      where: {
        studentId: dto.studentId,
        matiereId: dto.matiereId,
        periodId: dto.periodId,
        examId: dto.examId || null,
      },
    });

    if (existing) throw new ConflictException('Note already exists for this student/matiere/period/exam');

    return this.prisma.note.create({
      data: {
        studentId: dto.studentId,
        matiereId: dto.matiereId,
        periodId: dto.periodId,
        academicYearId: dto.academicYearId,
        examId: dto.examId,
        value: dto.value,
        maxValue: dto.maxValue,
        coefficient: dto.coefficient,
        comment: dto.comment,
        gradedBy: dto.gradedBy,
      },
    });
  }

  async update(id: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException(`Note with ID ${id} not found`);

    return this.prisma.note.update({
      where: { id },
      data: { value: dto.value, comment: dto.comment },
    });
  }

  async remove(id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException(`Note with ID ${id} not found`);
    await this.prisma.note.delete({ where: { id } });
    return { message: 'Note deleted' };
  }

  async getStudentPeriodNotes(studentId: string, periodId: string) {
    return this.prisma.note.findMany({
      where: { studentId, periodId },
      include: { matiere: { select: { id: true, name: true, coefficient: true } } },
    });
  }

  async bulkSave(dto: BulkSaveNotesDto, user?: any) {
    let periodId = dto.periodId;
    if (!periodId && dto.term) {
      const period = await this.prisma.academicPeriod.findFirst({
        where: {
          name: { contains: dto.term, mode: 'insensitive' },
        },
      });
      if (period) periodId = period.id;
    }

    if (!periodId) {
      const defaultPeriod = await this.prisma.academicPeriod.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (defaultPeriod) periodId = defaultPeriod.id;
    }

    let academicYearId = dto.academicYearId;
    if (!academicYearId) {
      const currentYear = await this.prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) academicYearId = currentYear.id;
      else {
        const anyYear = await this.prisma.academicYear.findFirst();
        if (anyYear) academicYearId = anyYear.id;
      }
    }

    if (!periodId || !academicYearId) {
      throw new BadRequestException('Période académique ou année scolaire introuvable');
    }

    const results = [];
    for (const g of dto.grades || []) {
      const val = g.average !== undefined
        ? Number(g.average)
        : ((Number(g.continuousScore || 0) * 0.4) + (Number(g.examScore || 0) * 0.6));

      const existing = await this.prisma.note.findFirst({
        where: {
          studentId: g.studentId,
          matiereId: dto.matiereId,
          periodId: periodId,
        },
      });

      if (existing) {
        const updated = await this.prisma.note.update({
          where: { id: existing.id },
          data: {
            value: Math.round(val * 100) / 100,
            comment: g.appreciation || existing.comment,
            gradedBy: user?.username || 'Teacher',
          },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.note.create({
          data: {
            studentId: g.studentId,
            matiereId: dto.matiereId,
            periodId: periodId,
            academicYearId: academicYearId,
            value: Math.round(val * 100) / 100,
            maxValue: 20,
            coefficient: 1,
            comment: g.appreciation || '',
            gradedBy: user?.username || 'Teacher',
          },
        });
        results.push(created);
      }
    }

    return {
      success: true,
      count: results.length,
      notes: results,
    };
  }
}
