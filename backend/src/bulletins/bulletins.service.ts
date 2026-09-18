import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBulletinDto, UpdateBulletinDto, QueryBulletinDto } from './bulletin.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class BulletinsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryBulletinDto) {
    const { page = 1, limit = 10, search, studentId, classId, periodId, academicYearId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;
    if (periodId) where.periodId = periodId;
    if (academicYearId) where.class = { academicYearId };
    if (search) {
      where.OR = [
        { comments: { contains: search, mode: 'insensitive' } },
        { student: { firstName: { contains: search, mode: 'insensitive' } } },
        { student: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { generatedAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.bulletin.findMany({
        where, skip, take: limit, orderBy,
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          class: { select: { id: true, name: true } },
          period: { select: { id: true, name: true } },
        },
      }),
      this.prisma.bulletin.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const bulletin = await this.prisma.bulletin.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
        class: { select: { id: true, name: true, code: true } },
        period: { select: { id: true, name: true } },
      },
    });
    if (!bulletin) throw new NotFoundException(`Bulletin with ID ${id} not found`);
    return bulletin;
  }

  async getDetailedBulletin(id: string) {
    const bulletin = await this.prisma.bulletin.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            registrationNumber: true,
            dateOfBirth: true,
            photo: true,
            user: { select: { email: true } },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            classLevel: { select: { name: true } },
            academicYear: { select: { name: true } },
          },
        },
        period: { select: { id: true, name: true, type: true } },
      },
    });

    if (!bulletin) throw new NotFoundException(`Bulletin avec ID ${id} introuvable`);

    // Fetch notes for this student and period
    const notes = await this.prisma.note.findMany({
      where: {
        studentId: bulletin.studentId,
        periodId: bulletin.periodId,
      },
      include: {
        matiere: { select: { id: true, name: true, code: true, coefficient: true } },
        exam: { select: { id: true, title: true, type: true } },
      },
    });

    // Group notes by Matière
    const matieresMap = new Map<string, any>();
    for (const note of notes) {
      const mId = note.matiereId;
      if (!matieresMap.has(mId)) {
        matieresMap.set(mId, {
          id: mId,
          name: note.matiere.name,
          code: note.matiere.code,
          coefficient: Number(note.matiere.coefficient) || 1,
          notes: [],
        });
      }
      matieresMap.get(mId).notes.push({
        id: note.id,
        value: Number(note.value),
        maxValue: Number(note.maxValue),
        coefficient: Number(note.coefficient),
        examTitle: note.exam?.title,
      });
    }

    const subjects = Array.from(matieresMap.values()).map((sub) => {
      const sumWeighted = sub.notes.reduce((acc: number, n: any) => acc + (n.value / n.maxValue) * 20 * n.coefficient, 0);
      const sumCoefs = sub.notes.reduce((acc: number, n: any) => acc + n.coefficient, 0);
      const average = sumCoefs > 0 ? Math.round((sumWeighted / sumCoefs) * 100) / 100 : 0;
      const totalPoints = Math.round(average * sub.coefficient * 100) / 100;
      let appreciation = 'Passable';
      if (average >= 16) appreciation = 'Très Bien';
      else if (average >= 14) appreciation = 'Bien';
      else if (average >= 12) appreciation = 'Assez Bien';
      else if (average < 10) appreciation = 'Insuffisant';

      return {
        ...sub,
        average,
        totalPoints,
        appreciation,
      };
    });

    // Class ranking statistics
    const classBulletins = await this.prisma.bulletin.findMany({
      where: { classId: bulletin.classId, periodId: bulletin.periodId },
      select: { averageScore: true },
    });
    const avgScores = classBulletins.map((b) => Number(b.averageScore));
    const classAverage = avgScores.length > 0 ? Math.round((avgScores.reduce((a, b) => a + b, 0) / avgScores.length) * 100) / 100 : 0;
    const maxAverage = avgScores.length > 0 ? Math.max(...avgScores) : 0;
    const minAverage = avgScores.length > 0 ? Math.min(...avgScores) : 0;

    return {
      ...bulletin,
      subjects,
      classStatistics: {
        totalStudents: avgScores.length,
        classAverage,
        maxAverage,
        minAverage,
      },
    };
  }

  async generateForClass(classId: string, periodId: string, user?: any) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        studentClassAssignments: {
          include: { student: true },
        },
        moduleAssignments: {
          include: { module: { include: { matieres: true } } },
        },
      },
    });

    if (!cls) throw new NotFoundException(`Classe introuvable`);

    const students = cls.studentClassAssignments.map((a) => a.student);
    if (students.length === 0) {
      throw new BadRequestException(`Aucun élève inscrit dans cette classe.`);
    }

    // Calculate averages for each student
    const studentAverages: { studentId: string; totalScore: number; averageScore: number }[] = [];

    for (const student of students) {
      const studentNotes = await this.prisma.note.findMany({
        where: { studentId: student.id, periodId },
        include: { matiere: true },
      });

      let totalWeightedScore = 0;
      let totalCoefficients = 0;

      const matiereNotesMap = new Map<string, any[]>();
      for (const note of studentNotes) {
        if (!matiereNotesMap.has(note.matiereId)) {
          matiereNotesMap.set(note.matiereId, []);
        }
        matiereNotesMap.get(note.matiereId)!.push(note);
      }

      for (const [, notesList] of matiereNotesMap.entries()) {
        const coef = Number(notesList[0]?.matiere?.coefficient) || 1;
        const sumWeighted = notesList.reduce(
          (acc, n) => acc + (Number(n.value) / Number(n.maxValue)) * 20 * Number(n.coefficient),
          0,
        );
        const sumCoef = notesList.reduce((acc, n) => acc + Number(n.coefficient), 0);
        const matiereAvg = sumCoef > 0 ? sumWeighted / sumCoef : 0;

        totalWeightedScore += matiereAvg * coef;
        totalCoefficients += coef;
      }

      const averageScore = totalCoefficients > 0 ? Math.round((totalWeightedScore / totalCoefficients) * 100) / 100 : 0;
      studentAverages.push({
        studentId: student.id,
        totalScore: Math.round(totalWeightedScore * 100) / 100,
        averageScore,
      });
    }

    // Rank students descending
    studentAverages.sort((a, b) => b.averageScore - a.averageScore);

    // Upsert bulletins with Rank and Deliberation / Rachat
    const createdBulletins = [];
    for (let i = 0; i < studentAverages.length; i++) {
      const { studentId, totalScore, averageScore } = studentAverages[i];
      const rank = i + 1;

      let isPromoted = false;
      let comments = 'Ajourné';
      if (averageScore >= 10.0) {
        isPromoted = true;
        if (averageScore >= 16) comments = 'Admis - Félicitations du conseil (Très Bien)';
        else if (averageScore >= 14) comments = 'Admis - Tableau d’honneur (Bien)';
        else if (averageScore >= 12) comments = 'Admis - Encouragements (Assez Bien)';
        else comments = 'Admis (Passable)';
      } else if (averageScore >= 9.5) {
        // Deliberation / Rachat rule
        isPromoted = true;
        comments = 'Admis par délibération du conseil de classe (Rachat)';
      }

      const bulletin = await this.prisma.bulletin.upsert({
        where: {
          studentId_periodId_classId: {
            studentId,
            periodId,
            classId,
          },
        },
        update: {
          totalScore,
          averageScore,
          rank,
          isPromoted,
          comments,
          generatedBy: user?.userId || 'SYSTEM',
        },
        create: {
          studentId,
          periodId,
          classId,
          totalScore,
          averageScore,
          rank,
          isPromoted,
          comments,
          generatedBy: user?.userId || 'SYSTEM',
        },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          class: { select: { id: true, name: true } },
          period: { select: { id: true, name: true } },
        },
      });
      createdBulletins.push(bulletin);
    }

    return {
      message: `${createdBulletins.length} bulletins calculés et délibérés avec succès`,
      count: createdBulletins.length,
      bulletins: createdBulletins,
    };
  }

  async create(dto: CreateBulletinDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required');
    }

    const existing = await this.prisma.bulletin.findUnique({
      where: {
        studentId_periodId_classId: {
          studentId: dto.studentId,
          periodId: dto.periodId,
          classId: dto.classId,
        },
      },
    });
    if (existing) throw new ConflictException('Bulletin already exists for this student, period, and class');

    return this.prisma.bulletin.create({
      data: {
        studentId: dto.studentId,
        classId: dto.classId,
        periodId: dto.periodId,
        totalScore: dto.totalScore,
        averageScore: dto.averageScore,
        rank: dto.rank,
        isPromoted: dto.isPromoted,
        comments: dto.comments,
        generatedBy: dto.generatedBy,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        class: { select: { id: true, name: true } },
        period: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, dto: UpdateBulletinDto) {
    const bulletin = await this.prisma.bulletin.findUnique({ where: { id } });
    if (!bulletin) throw new NotFoundException(`Bulletin with ID ${id} not found`);

    return this.prisma.bulletin.update({
      where: { id },
      data: {
        totalScore: dto.totalScore,
        averageScore: dto.averageScore,
        rank: dto.rank,
        isPromoted: dto.isPromoted,
        comments: dto.comments,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        class: { select: { id: true, name: true } },
        period: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    const bulletin = await this.prisma.bulletin.findUnique({ where: { id } });
    if (!bulletin) throw new NotFoundException(`Bulletin with ID ${id} not found`);
    await this.prisma.bulletin.delete({ where: { id } });
    return { message: 'Bulletin deleted successfully' };
  }
}
