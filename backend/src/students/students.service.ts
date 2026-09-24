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
    const { page = 1, limit = 50, search, establishmentId, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all') {
      where.establishmentId = establishmentId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (!query.includeDeleted) {
      where.isDeleted = false;
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
            include: {
              class: { select: { id: true, name: true, classLevel: true } },
              academicYear: { select: { id: true, name: true } },
            },
            take: 1,
          },
          parents: {
            include: {
              parent: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
            },
            take: 1,
          },
          payments: {
            select: { id: true, amount: true, status: true, method: true, createdAt: true },
            take: 10,
          },
          establishment: { select: { id: true, name: true, slug: true } },
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

    const regNum =
      dto.registrationNumber ||
      dto.matricule ||
      `ELEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await this.prisma.student.findUnique({
      where: { registrationNumber: regNum },
    });
    if (existing) throw new ConflictException('Registration number / matricule already exists');

    let userId = dto.userId || null;

    // If email is provided and no userId, create a linked User account
    if (dto.email && !userId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const est = await this.prisma.establishment.findUnique({
          where: { id: establishmentId },
          select: { tenantId: true },
        });

        const baseUsername = dto.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';
        let uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
        const userWithUsername = await this.prisma.user.findUnique({ where: { username: uniqueUsername } });
        if (userWithUsername) {
          uniqueUsername = `${baseUsername}_${Date.now()}`;
        }

        const tempPassword = (dto as any).password || `St_${Math.random().toString(36).slice(-8)}!${Math.floor(10 + Math.random() * 90)}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await this.prisma.user.create({
          data: {
            email: dto.email,
            username: uniqueUsername,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            tenantId: est?.tenantId,
          },
        });
        userId = newUser.id;

        // Assign STUDENT role
        const studentRole = await this.prisma.role.findFirst({
          where: { code: 'STUDENT' },
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
        registrationNumber: regNum,
        userId,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    // Resolve class assignment if classId or className is provided
    let targetClassId = dto.classId;
    if (!targetClassId && dto.className) {
      const matchingClass = await this.prisma.class.findFirst({
        where: {
          establishmentId,
          name: { contains: dto.className.split(' ')[0], mode: 'insensitive' },
        },
      });
      if (matchingClass) targetClassId = matchingClass.id;
    }

    if (targetClassId) {
      const currentYear = await this.prisma.academicYear.findFirst({
        where: { establishmentId, isCurrent: true },
      });
      if (currentYear) {
        await this.prisma.studentClassAssignment.create({
          data: {
            studentId: student.id,
            classId: targetClassId,
            academicYearId: currentYear.id,
          },
        });
      }
    }

    // Link Parent if parent info is provided
    if (dto.parentName || dto.parentPhone || dto.parentEmail) {
      const parentParts = (dto.parentName || 'Tuteur Légal').split(' ');
      const parentFirst = parentParts[0] || 'Parent';
      const parentLast = parentParts.slice(1).join(' ') || 'Famille';

      let parent = dto.parentEmail
        ? await this.prisma.parent.findFirst({ where: { email: dto.parentEmail, establishmentId } })
        : null;

      if (!parent && dto.parentPhone) {
        parent = await this.prisma.parent.findFirst({ where: { phone: dto.parentPhone, establishmentId } });
      }

      if (!parent) {
        parent = await this.prisma.parent.create({
          data: {
            establishmentId,
            firstName: parentFirst,
            lastName: parentLast,
            phone: dto.parentPhone || null,
            email: dto.parentEmail || null,
            relationship: 'PARENT',
          },
        });
      }

      await this.prisma.studentParent.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          relationship: 'PARENT',
          isPrimaryContact: true,
        },
      });
    }

    // Initialize tuition payment if tuitionPaid is provided
    if (dto.tuitionPaid && dto.tuitionPaid > 0) {
      await this.prisma.studentPayment.create({
        data: {
          studentId: student.id,
          amount: dto.tuitionPaid,
          status: 'PAID',
          method: 'CASH',
          paidAt: new Date(),
          reference: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    }

    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);

    const regNum = dto.registrationNumber || dto.matricule || undefined;

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
        registrationNumber: regNum,
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

  async restore(id: string, user?: any) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    const restored = await this.prisma.student.update({
      where: { id },
      data: { isActive: true },
      include: {
        establishment: { select: { id: true, name: true, slug: true } },
        classAssignments: {
          include: { class: { select: { id: true, name: true } } },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user?.id,
        actorSnapshot,
        action: 'RESTORE',
        entity: 'Student',
        entityId: id,
        status: 'SUCCESS',
        oldValues: { isActive: false },
        newValues: { isActive: true },
      },
    });

    return { message: 'Élève restauré avec succès', student: restored };
  }
}
