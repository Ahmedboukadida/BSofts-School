import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, UpdateExamDto, QueryExamDto, AddQuestionDto, UpdateQuestionDto, SubmitExamDto } from './exam.dto';
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

  async addQuestion(examId: string, dto: AddQuestionDto, user?: any) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException(`Exam with ID ${examId} not found`);

    const count = await this.prisma.examQuestion.count({ where: { examId } });
    const question = await this.prisma.examQuestion.create({
      data: {
        examId,
        type: dto.type as any,
        content: dto.content,
        options: dto.options ?? null,
        maxScore: dto.maxScore ?? 1,
        sortOrder: dto.sortOrder ?? count + 1,
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
        entity: 'ExamQuestion',
        entityId: question.id,
        status: 'SUCCESS',
        newValues: question as any,
      },
    });

    return question;
  }

  async updateQuestion(examId: string, questionId: string, dto: UpdateQuestionDto, user?: any) {
    const question = await this.prisma.examQuestion.findFirst({
      where: { id: questionId, examId },
    });
    if (!question) throw new NotFoundException(`Question with ID ${questionId} not found in Exam ${examId}`);

    const updated = await this.prisma.examQuestion.update({
      where: { id: questionId },
      data: {
        content: dto.content,
        options: dto.options !== undefined ? dto.options : undefined,
        maxScore: dto.maxScore !== undefined ? dto.maxScore : undefined,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : undefined,
      },
    });

    return updated;
  }

  async deleteQuestion(examId: string, questionId: string, user?: any) {
    const question = await this.prisma.examQuestion.findFirst({
      where: { id: questionId, examId },
    });
    if (!question) throw new NotFoundException(`Question with ID ${questionId} not found in Exam ${examId}`);

    await this.prisma.examQuestion.delete({ where: { id: questionId } });
    return { message: 'Question deleted successfully' };
  }

  async startExam(examId: string, user: any, ipAddress?: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        class: { select: { id: true, name: true } },
        matiere: { select: { id: true, name: true } },
      },
    });
    if (!exam) throw new NotFoundException(`Exam with ID ${examId} not found`);
    if (!exam.isOnline) throw new BadRequestException('This exam is not configured for online participation');

    // Find student record if user is student
    let studentId = user?.student?.id;
    if (!studentId && user?.id) {
      const student = await this.prisma.student.findFirst({ where: { userId: user.id } });
      if (student) studentId = student.id;
    }

    if (!studentId && user?.role === 'STUDENT') {
      throw new ForbiddenException('No student profile found for current user');
    }

    let submission: any = null;
    if (studentId) {
      submission = await this.prisma.examSubmission.findUnique({
        where: { examId_studentId: { examId, studentId } },
      });

      if (!submission) {
        submission = await this.prisma.examSubmission.create({
          data: {
            examId,
            studentId,
            startedAt: new Date(),
            status: 'IN_PROGRESS',
            ipAddress: ipAddress || null,
          },
        });
      } else if (submission.status === 'SUBMITTED' || submission.status === 'GRADED') {
        throw new BadRequestException('You have already submitted this exam');
      }
    }

    // Strip answers from questions for student taking the exam
    const isStudent = user?.role === 'STUDENT' || Boolean(studentId);
    const sanitizedQuestions = exam.questions.map((q) => {
      let sanitizedOptions = q.options;
      if (isStudent && Array.isArray(q.options)) {
        sanitizedOptions = (q.options as any[]).map((opt) => {
          const { isCorrect, ...rest } = opt;
          return rest;
        });
      }
      return {
        id: q.id,
        type: q.type,
        content: q.content,
        options: sanitizedOptions,
        maxScore: q.maxScore,
        sortOrder: q.sortOrder,
      };
    });

    return {
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        maxScore: exam.maxScore,
        startTime: exam.startTime,
        endTime: exam.endTime,
        antiCheat: exam.antiCheat,
        class: exam.class,
        matiere: exam.matiere,
      },
      submission: submission ? {
        id: submission.id,
        startedAt: submission.startedAt,
        status: submission.status,
      } : null,
      questions: sanitizedQuestions,
    };
  }

  async submitExam(examId: string, user: any, dto: SubmitExamDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });
    if (!exam) throw new NotFoundException(`Exam with ID ${examId} not found`);

    let studentId = user?.student?.id;
    if (!studentId && user?.id) {
      const student = await this.prisma.student.findFirst({ where: { userId: user.id } });
      if (student) studentId = student.id;
    }
    if (!studentId) throw new BadRequestException('Valid student profile is required to submit exam');

    const submission = await this.prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId, studentId } },
      include: { answers: true },
    });
    if (!submission) {
      throw new NotFoundException('No active exam submission found. Please start the exam first.');
    }
    if (submission.status === 'SUBMITTED' || submission.status === 'GRADED') {
      throw new BadRequestException('Exam has already been submitted');
    }

    let calculatedTotalScore = 0;
    const answerPromises = [];

    for (const item of dto.answers || []) {
      const question = exam.questions.find((q) => q.id === item.questionId);
      if (!question) continue;

      let isCorrect: boolean | null = null;
      let score: number = 0;

      if (question.type === 'QCM') {
        const opts = Array.isArray(question.options) ? (question.options as any[]) : [];
        const correctOpt = opts.find((o) => o.isCorrect === true);
        if (correctOpt) {
          const match =
            String(item.answer).trim().toLowerCase() === String(correctOpt.id).trim().toLowerCase() ||
            String(item.answer).trim().toLowerCase() === String(correctOpt.text).trim().toLowerCase();
          if (match) {
            isCorrect = true;
            score = Number(question.maxScore);
          } else {
            isCorrect = false;
            score = 0;
          }
        }
      } else if (question.type === 'TRUE_FALSE') {
        const opts = Array.isArray(question.options) ? (question.options as any[]) : [];
        const correctOpt = opts.find((o) => o.isCorrect === true);
        if (correctOpt) {
          const match = String(item.answer).trim().toLowerCase() === String(correctOpt.id || correctOpt.text).trim().toLowerCase();
          isCorrect = match;
          score = match ? Number(question.maxScore) : 0;
        }
      }

      calculatedTotalScore += score;

      answerPromises.push(
        this.prisma.examAnswer.create({
          data: {
            submissionId: submission.id,
            questionId: question.id,
            answer: item.answer || null,
            fileUrl: item.fileUrl || null,
            score: score,
            isCorrect: isCorrect,
          },
        })
      );
    }

    await Promise.all(answerPromises);

    const updatedSubmission = await this.prisma.examSubmission.update({
      where: { id: submission.id },
      data: {
        totalScore: Math.min(calculatedTotalScore, Number(exam.maxScore)),
        status: 'GRADED',
        submittedAt: new Date(),
        tabSwitches: dto.tabSwitches || 0,
      },
    });

    return {
      submissionId: updatedSubmission.id,
      totalScore: updatedSubmission.totalScore,
      maxScore: exam.maxScore,
      status: updatedSubmission.status,
      submittedAt: updatedSubmission.submittedAt,
    };
  }

  async getSubmissions(examId: string, user: any) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException(`Exam with ID ${examId} not found`);

    const submissions = await this.prisma.examSubmission.findMany({
      where: { examId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            registrationNumber: true,
          },
        },
        _count: { select: { answers: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions;
  }

  async getMySubmission(examId: string, user: any) {
    let studentId = user?.student?.id;
    if (!studentId && user?.id) {
      const student = await this.prisma.student.findFirst({ where: { userId: user.id } });
      if (student) studentId = student.id;
    }
    if (!studentId) throw new BadRequestException('Student profile not found');

    const submission = await this.prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId, studentId } },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                maxScore: true,
                options: true,
              },
            },
          },
        },
      },
    });

    if (!submission) throw new NotFoundException('No submission found for this exam');
    return submission;
  }
}
