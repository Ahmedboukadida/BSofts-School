import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto, QueryStudentDto } from './student.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { StudentEntity } from './student.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryStudentDto) {
    const { page = 1, limit = 10, search, establishmentId, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (isActive !== undefined) {
      where.isActive = isActive;
    } else if (!query.includeDeleted) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where, skip, take: limit, orderBy,
        include: {
          classAssignments: {
            include: { class: { select: { id: true, name: true } } },
            take: 1,
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    const entities = data.map((item) => new StudentEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        classAssignments: {
          include: {
            class: { include: { classLevel: true } },
            academicYear: { select: { id: true, name: true } },
          },
        },
        parents: {
          include: { parent: { select: { id: true, firstName: true, lastName: true, phone: true } } },
        },
        notes: { take: 5 },
        payments: { take: 5 },
      },
    });
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);
    return student;
  }

  async findMe(user: any) {
    if (!user) throw new NotFoundException('User not authenticated');

    let student: any = await this.prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        establishment: { select: { id: true, name: true, slug: true, email: true, phone: true } },
        classAssignments: {
          include: {
            class: { include: { classLevel: true } },
            academicYear: { select: { id: true, name: true, isCurrent: true } },
          },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
        notes: {
          include: {
            matiere: { select: { id: true, name: true, code: true, coefficient: true, maxScore: true } },
            period: { select: { id: true, name: true, type: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attendances: {
          include: {
            session: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
              },
            },
          },
          orderBy: { markedAt: 'desc' },
          take: 50,
        },
        bulletins: {
          include: {
            period: { select: { id: true, name: true, type: true } },
          },
          orderBy: { generatedAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!student && (user.isRoot || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      student = await this.prisma.student.findFirst({
        where: user.establishmentId ? { establishmentId: user.establishmentId, isActive: true } : { isActive: true },
        include: {
          establishment: { select: { id: true, name: true, slug: true, email: true, phone: true } },
          classAssignments: {
            include: {
              class: { include: { classLevel: true } },
              academicYear: { select: { id: true, name: true, isCurrent: true } },
            },
            orderBy: { assignedAt: 'desc' },
            take: 1,
          },
          notes: {
            include: {
              matiere: { select: { id: true, name: true, code: true, coefficient: true, maxScore: true } },
              period: { select: { id: true, name: true, type: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          attendances: {
            include: {
              session: {
                select: {
                  id: true,
                  date: true,
                  startTime: true,
                  endTime: true,
                },
              },
            },
            orderBy: { markedAt: 'desc' },
            take: 50,
          },
          bulletins: {
            include: {
              period: { select: { id: true, name: true, type: true } },
            },
            orderBy: { generatedAt: 'desc' },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });
    }

    if (!student) {
      throw new NotFoundException('No student record found for current user');
    }

    const currentClassId = student.classAssignments?.[0]?.class?.id;
    let upcomingSessions: any[] = [];
    let upcomingExams: any[] = [];
    if (currentClassId) {
      [upcomingSessions, upcomingExams] = await Promise.all([
        this.prisma.session.findMany({
          where: { classId: currentClassId, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          include: {
            teacher: { select: { id: true, firstName: true, lastName: true } },
            room: { select: { id: true, name: true } },
            schedule: { include: { matiere: { select: { id: true, name: true, code: true } } } },
          },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          take: 30,
        }),
        this.prisma.exam.findMany({
          where: { classId: currentClassId, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          include: {
            matiere: { select: { id: true, name: true, code: true } },
          },
          orderBy: { startTime: 'asc' },
          take: 10,
        }),
      ]);
    }

    return {
      student,
      upcomingSessions,
      upcomingExams,
    };
  }

  async create(dto: CreateStudentDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    const existing = await this.prisma.student.findUnique({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) throw new ConflictException('Registration number already exists');

    let userId = dto.userId || null;

    // If email is provided and no userId, create a linked User account
    if (dto.email && !userId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const hashedPassword = await bcrypt.hash('Student@123', 10);
        const newUser = await this.prisma.user.create({
          data: {
            email: dto.email,
            username: dto.email.split('@')[0],
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
          },
        });
        userId = newUser.id;

        // Assign STUDENT role
        const studentRole = await this.prisma.role.findUnique({
          where: { name: 'STUDENT' },
        });
        if (studentRole) {
          await this.prisma.userRoleAssignment.create({
            data: {
              userId: newUser.id,
              roleId: studentRole.id,
              establishmentId,
            },
          });
        }
      }
    }

    const student = await this.prisma.student.create({
      data: {
        establishmentId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender as any,
        phone: dto.phone,
        address: dto.address,
        photo: dto.photo,
        registrationNumber: dto.registrationNumber,
        userId,
      },
    });

    // If classId is provided, create class assignment
    if (dto.classId) {
      const currentYear = await this.prisma.academicYear.findFirst({
        where: { establishmentId, isCurrent: true },
      });
      if (currentYear) {
        await this.prisma.studentClassAssignment.create({
          data: {
            studentId: student.id,
            classId: dto.classId,
            academicYearId: currentYear.id,
          },
        });
      }
    }

    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);

    return this.prisma.student.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender as any,
        phone: dto.phone,
        address: dto.address,
        photo: dto.photo,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.student.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Student',
            entityId: id,
            status: 'SUCCESS',
            oldValues: student as any,
          },
        });
        return { message: 'Student permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Student ${id}: ${err.message}`,
            stack: err.stack,
            context: 'StudentsService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete student. Dependent grades or attendance exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.student.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'Student',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      return { message: 'Student deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of Student ${id}: ${err.message}`,
          stack: err.stack,
          context: 'StudentsService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
