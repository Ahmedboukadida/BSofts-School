import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReportDto } from './report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: GenerateReportDto) {
    switch (dto.reportType) {
      case 'ATTENDANCE':
        return this.attendanceReport(dto);
      case 'EXAM_RESULTS':
        return this.examResultsReport(dto);
      case 'FINANCIAL':
        return this.financialReport(dto);
      case 'ENROLLMENT':
        return this.enrollmentReport(dto);
      case 'TEACHER_PERFORMANCE':
        return this.teacherPerformanceReport(dto);
      case 'CLASS_PERFORMANCE':
        return this.classPerformanceReport(dto);
      case 'PAYMENT_COLLECTION':
        return this.paymentCollectionReport(dto);
      case 'OVERVIEW':
        return this.overviewReport(dto);
      default:
        throw new Error('Invalid report type');
    }
  }

  private async overviewReport(dto: GenerateReportDto) {
    const where: any = {};
    if (dto.establishmentId) where.establishmentId = dto.establishmentId;

    const [studentCount, teacherCount, classCount, paymentTotal, examCount] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.teacher.count({ where }),
      this.prisma.class.count({ where }),
      this.prisma.studentPayment.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      type: 'OVERVIEW',
      summary: {
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalClasses: classCount,
        totalPayments: paymentTotal._count,
        totalRevenue: Number(paymentTotal._sum.amount || 0),
        totalExams: examCount,
      },
    };
  }

  private async attendanceReport(dto: GenerateReportDto) {
    const where: any = {};
    if (dto.classId) where.student = { classAssignments: { some: { classId: dto.classId } } };
    if (dto.startDate) where.date = { gte: new Date(dto.startDate) };
    if (dto.endDate) where.date = { lte: new Date(dto.endDate) };

    const records = await this.prisma.studentAttendance.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
      },
    });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      excused: records.filter(r => r.status === 'EXCUSED').length,
    };

    return { type: 'ATTENDANCE', summary, records };
  }

  private async examResultsReport(dto: GenerateReportDto) {
    const where: any = {};
    if (dto.academicYearId || dto.classId) {
      where.exam = {};
      if (dto.academicYearId) where.exam.academicYearId = dto.academicYearId;
      if (dto.classId) where.exam.classId = dto.classId;
    }

    const submissions = await this.prisma.examSubmission.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
        exam: { select: { id: true, title: true, maxScore: true } },
        answers: true,
      },
    });

    const summary = {
      total: submissions.length,
      average: submissions.length > 0
        ? submissions.reduce((sum: number, r) => sum + Number(r.totalScore || 0), 0) / submissions.length
        : 0,
      completionRate: submissions.length > 0
        ? (submissions.filter((r: any) => r.status === 'SUBMITTED').length / submissions.length) * 100
        : 0,
    };

    return { type: 'EXAM_RESULTS', summary, submissions };
  }

  private async financialReport(dto: GenerateReportDto) {
    const where: any = {};
    if (dto.establishmentId) where.establishmentId = dto.establishmentId;
    if (dto.startDate) where.createdAt = { gte: new Date(dto.startDate) };
    if (dto.endDate) where.createdAt = { lte: new Date(dto.endDate) };

    const [income, expense] = await Promise.all([
      this.prisma.financialTransaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financialTransaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      type: 'FINANCIAL',
      summary: {
        totalIncome: Number(income._sum.amount || 0),
        totalExpense: Number(expense._sum.amount || 0),
        netProfit: Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
        transactionCount: income._count + expense._count,
      },
    };
  }

  private async enrollmentReport(dto: GenerateReportDto) {
    const where: any = {};
    if (dto.classId) where.classId = dto.classId;
    if (dto.academicYearId) where.academicYearId = dto.academicYearId;

    const assignments = await this.prisma.studentClassAssignment.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
        class: { select: { id: true, name: true } },
      },
    });

    const byClass: Record<string, number> = {};
    assignments.forEach(a => {
      const className = a.class?.name || 'Unassigned';
      byClass[className] = (byClass[className] || 0) + 1;
    });

    return {
      type: 'ENROLLMENT',
      summary: { totalStudents: assignments.length, byClass },
    };
  }

  private async teacherPerformanceReport(dto: GenerateReportDto) {
    const teachers = await this.prisma.teacher.findMany({
      where: { isActive: true },
      include: {
        sessions: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const performance = teachers.map((t: any) => {
      const allLessons = t.sessions.flatMap((s: any) => s.lessons);
      return {
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        totalSessions: t.sessions.length,
        totalLessons: allLessons.length,
      };
    });

    return { type: 'TEACHER_PERFORMANCE', teachers: performance };
  }

  private async classPerformanceReport(dto: GenerateReportDto) {
    const where: any = {};
    if (dto.classId) where.id = dto.classId;

    const classes = await this.prisma.class.findMany({
      where,
      include: {
        studentClassAssignments: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const performance = classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      studentCount: c.studentClassAssignments.length,
    }));

    return { type: 'CLASS_PERFORMANCE', classes: performance };
  }

  private async paymentCollectionReport(dto: GenerateReportDto) {
    const where: any = {};
    if (dto.establishmentId) where.establishmentId = dto.establishmentId;
    if (dto.startDate) where.createdAt = { gte: new Date(dto.startDate) };
    if (dto.endDate) where.createdAt = { lte: new Date(dto.endDate) };

    const payments = await this.prisma.studentPayment.findMany({ where });

    const byStatus: Record<string, number> = {};
    let totalCollected = 0;
    payments.forEach((p: any) => {
      byStatus[p.status] = (byStatus[p.status] || 0) + Number(p.amount);
      if (p.status === 'PAID') totalCollected += Number(p.amount);
    });

    return {
      type: 'PAYMENT_COLLECTION',
      summary: {
        totalPayments: payments.length,
        totalCollected,
        byStatus,
      },
    };
  }
}
