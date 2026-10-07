import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBulletinDto, UpdateBulletinDto, QueryBulletinDto } from './bulletin.dto';
import { PaginatedDto } from '../common/pagination.dto';
import PDFDocument from 'pdfkit';

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
            establishment: { select: { name: true, phone: true, email: true, address: true, logo: true } },
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

  async generatePdf(id: string): Promise<Buffer> {
    const detailed = await this.getDetailedBulletin(id);
    const establishment = (detailed.class as any)?.establishment;

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const brandColor = '#1e3a8a';
      const textColor = '#1f2937';
      const mutedColor = '#6b7280';
      const borderColor = '#d1d5db';
      const tableHeaderBg = '#f3f4f6';

      // 1. Header (School & Academic Year Info)
      doc.fillColor(brandColor).fontSize(16).font('Helvetica-Bold')
        .text(establishment?.name || 'ÉTABLISSEMENT SCOLAIRE', 36, 36, { align: 'left' });

      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica')
        .text(establishment?.address || '', 36, 56)
        .text(
          `${establishment?.phone ? 'Tél: ' + establishment.phone : ''} ${establishment?.email ? '| Email: ' + establishment.email : ''}`,
          36,
          68,
        );

      doc.fillColor(brandColor).fontSize(11).font('Helvetica-Bold')
        .text(`ANNÉE SCOLAIRE: ${detailed.class?.academicYear?.name || '2025-2026'}`, 36, 36, { align: 'right' });
      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica')
        .text(`Période: ${detailed.period?.name || '-'}`, 36, 52, { align: 'right' })
        .text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, 36, 68, { align: 'right' });

      // Horizontal separator line
      doc.strokeColor(brandColor).lineWidth(1.5).moveTo(36, 85).lineTo(559, 85).stroke();

      // Title Banner
      doc.rect(36, 95, 523, 26).fill('#1e3a8a');
      doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
        .text('BULLETIN SCOLAIRE OFFICIEL', 36, 102, { align: 'center' });

      // 2. Student Info Card
      doc.rect(36, 130, 523, 62).fillAndStroke('#f8fafc', borderColor);
      doc.fillColor(textColor).fontSize(9.5).font('Helvetica-Bold');
      doc.text('Nom & Prénom:', 48, 140);
      doc.font('Helvetica').text(`${detailed.student.lastName.toUpperCase()} ${detailed.student.firstName}`, 135, 140);

      doc.font('Helvetica-Bold').text('Matricule:', 48, 158);
      doc.font('Helvetica').text(detailed.student.registrationNumber || 'N/A', 135, 158);

      doc.font('Helvetica-Bold').text('Date de Naiss.:', 48, 176);
      const dob = detailed.student.dateOfBirth
        ? new Date(detailed.student.dateOfBirth).toLocaleDateString('fr-FR')
        : 'N/A';
      doc.font('Helvetica').text(dob, 135, 176);

      doc.font('Helvetica-Bold').text('Classe:', 320, 140);
      doc.font('Helvetica').text(`${detailed.class.name} (${detailed.class.classLevel?.name || '-'})`, 390, 140);

      doc.font('Helvetica-Bold').text('Effectif:', 320, 158);
      doc.font('Helvetica').text(`${detailed.classStatistics.totalStudents} élèves`, 390, 158);

      doc.font('Helvetica-Bold').text('Période:', 320, 176);
      doc.font('Helvetica').text(detailed.period.name, 390, 176);

      // 3. Subjects Table
      let currentY = 202;
      const colMatiere = 44;
      const colCoef = 200;
      const colNotes = 250;
      const colAvg = 380;
      const colTotal = 435;
      const colApprec = 485;

      // Table Header
      doc.rect(36, currentY, 523, 20).fill(tableHeaderBg);
      doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold');
      doc.text('MATIÈRE', colMatiere, currentY + 5);
      doc.text('COEF', colCoef, currentY + 5, { width: 35, align: 'center' });
      doc.text('ÉVALUATIONS', colNotes, currentY + 5, { width: 120 });
      doc.text('MOY /20', colAvg, currentY + 5, { width: 45, align: 'center' });
      doc.text('TOTAL', colTotal, currentY + 5, { width: 40, align: 'center' });
      doc.text('APPRÉCIATION', colApprec, currentY + 5, { width: 68 });
      currentY += 20;

      // Table Rows
      doc.font('Helvetica').fontSize(8.5);
      let totalCoefSum = 0;
      let totalPointsSum = 0;

      for (let i = 0; i < detailed.subjects.length; i++) {
        const sub = detailed.subjects[i];
        totalCoefSum += sub.coefficient;
        totalPointsSum += sub.totalPoints;

        const rowBg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(36, currentY, 523, 18).fillAndStroke(rowBg, borderColor);

        doc.fillColor(textColor).font('Helvetica-Bold').text(sub.name, colMatiere, currentY + 5, { width: 150 });
        doc.font('Helvetica').text(sub.coefficient.toString(), colCoef, currentY + 5, { width: 35, align: 'center' });

        const notesStr = sub.notes.map((n: any) => `${Number(n.value).toFixed(1)}`).join(', ') || '-';
        doc.fillColor(mutedColor).text(notesStr, colNotes, currentY + 5, { width: 120 });

        doc.fillColor(textColor).font('Helvetica-Bold')
          .text(sub.average.toFixed(2), colAvg, currentY + 5, { width: 45, align: 'center' });
        doc.font('Helvetica')
          .text(sub.totalPoints.toFixed(2), colTotal, currentY + 5, { width: 40, align: 'center' });

        let apprecColor = textColor;
        if (sub.average >= 14) apprecColor = '#15803d';
        else if (sub.average < 10) apprecColor = '#b91c1c';
        doc.fillColor(apprecColor).font('Helvetica').text(sub.appreciation, colApprec, currentY + 5, { width: 68 });

        currentY += 18;
      }

      // Total Row
      doc.rect(36, currentY, 523, 20).fillAndStroke('#eef2ff', borderColor);
      doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(9);
      doc.text('TOTAL GÉNÉRAL', colMatiere, currentY + 5);
      doc.text(totalCoefSum.toString(), colCoef, currentY + 5, { width: 35, align: 'center' });
      doc.text(totalPointsSum.toFixed(2), colTotal, currentY + 5, { width: 40, align: 'center' });
      currentY += 26;

      // 4. Results & Deliberation Section
      const summaryY = currentY;
      // Left Box: Student Performance
      doc.rect(36, summaryY, 255, 90).fillAndStroke('#f8fafc', borderColor);
      doc.fillColor(brandColor).fontSize(10).font('Helvetica-Bold').text('RÉSULTATS DE L’ÉLÈVE', 46, summaryY + 8);

      const avgScore = Number(detailed.averageScore || 0);
      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('Moyenne Générale:', 46, summaryY + 28);
      doc.fillColor(avgScore >= 10 ? '#15803d' : '#b91c1c').fontSize(12).font('Helvetica-Bold')
        .text(`${avgScore.toFixed(2)} / 20`, 160, summaryY + 26);

      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('Rang:', 46, summaryY + 48);
      doc.font('Helvetica').text(
        `${detailed.rank || '-'} ${detailed.rank === 1 ? 'er' : 'ème'} sur ${detailed.classStatistics.totalStudents}`,
        160,
        summaryY + 48,
      );

      doc.font('Helvetica-Bold').text('Décision:', 46, summaryY + 68);
      const isAdm = detailed.isPromoted || avgScore >= 10;
      doc.fillColor(isAdm ? '#15803d' : '#b91c1c').font('Helvetica-Bold')
        .text(isAdm ? 'ADMIS(E)' : 'AJOURNÉ(E)', 160, summaryY + 68);

      // Right Box: Class Statistics
      doc.rect(304, summaryY, 255, 90).fillAndStroke('#f8fafc', borderColor);
      doc.fillColor(brandColor).fontSize(10).font('Helvetica-Bold').text('STATISTIQUES DE LA CLASSE', 314, summaryY + 8);

      doc.fillColor(textColor).fontSize(9).font('Helvetica').text('Moyenne de classe:', 314, summaryY + 28);
      doc.font('Helvetica-Bold').text(`${Number(detailed.classStatistics.classAverage || 0).toFixed(2)} / 20`, 440, summaryY + 28);

      doc.font('Helvetica').text('Plus forte moyenne:', 314, summaryY + 48);
      doc.font('Helvetica-Bold').fillColor('#15803d').text(`${Number(detailed.classStatistics.maxAverage || 0).toFixed(2)} / 20`, 440, summaryY + 48);

      doc.fillColor(textColor).font('Helvetica').text('Plus faible moyenne:', 314, summaryY + 68);
      doc.font('Helvetica-Bold').fillColor('#b91c1c').text(`${Number(detailed.classStatistics.minAverage || 0).toFixed(2)} / 20`, 440, summaryY + 68);

      // Observation / Comments
      currentY = summaryY + 98;
      doc.rect(36, currentY, 523, 28).fillAndStroke('#ffffff', borderColor);
      doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold').text('Appréciation globale du conseil:', 44, currentY + 5);
      doc.font('Helvetica-Oblique').fillColor(mutedColor).text(
        detailed.comments || (avgScore >= 10 ? 'Travail satisfaisant' : 'Doit redoubler d’efforts'),
        44,
        currentY + 16,
      );

      // 5. Signatures
      const sigY = currentY + 36;
      doc.rect(36, sigY, 255, 55).stroke(borderColor);
      doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold').text('Le Professeur Principal', 46, sigY + 6);

      doc.rect(304, sigY, 255, 55).stroke(borderColor);
      doc.text('Le Chef d’Établissement (Cachet & Signature)', 314, sigY + 6);

      // Footer
      doc.fillColor(mutedColor).fontSize(7).font('Helvetica')
        .text('Document officiel généré automatiquement par la plateforme BSofts-School', 36, 785, {
          align: 'center',
          width: 523,
        });

      doc.end();
    });
  }
}
