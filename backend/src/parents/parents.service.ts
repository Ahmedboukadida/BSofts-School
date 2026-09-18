import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentDto, UpdateParentDto, QueryParentDto } from './parent.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { ParentEntity } from './parent.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryParentDto) {
    const { page = 1, limit = 10, search, establishmentId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (!query.includeDeleted) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.parent.findMany({
        where, skip, take: limit, orderBy,
        include: {
          students: { include: { student: { select: { id: true, firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.parent.count({ where }),
    ]);

    const entities = data.map((item) => new ParentEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        students: {
          include: { student: true },
        },
      },
    });
    if (!parent) throw new NotFoundException(`Parent with ID ${id} not found`);
    return parent;
  }

  async findMe(user: any) {
    if (!user) throw new NotFoundException('User not authenticated');

    let parent: any = await this.prisma.parent.findUnique({
      where: { userId: user.id },
      include: {
        establishment: { select: { id: true, name: true, slug: true, email: true, phone: true } },
        students: {
          include: {
            student: {
              include: {
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
                    matiere: { select: { id: true, name: true, code: true, coefficient: true } },
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
                  take: 30,
                },
                bulletins: {
                  include: { period: { select: { id: true, name: true, type: true } } },
                  orderBy: { generatedAt: 'desc' },
                },
                payments: {
                  orderBy: { createdAt: 'desc' },
                  take: 20,
                },
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!parent && (user.isRoot || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      parent = await this.prisma.parent.findFirst({
        where: user.establishmentId ? { establishmentId: user.establishmentId, isActive: true } : { isActive: true },
        include: {
          establishment: { select: { id: true, name: true, slug: true, email: true, phone: true } },
          students: {
            include: {
              student: {
                include: {
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
                      matiere: { select: { id: true, name: true, code: true, coefficient: true } },
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
                    take: 30,
                  },
                  bulletins: {
                    include: { period: { select: { id: true, name: true, type: true } } },
                    orderBy: { generatedAt: 'desc' },
                  },
                  payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                  },
                },
              },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });
    }

    if (!parent) {
      throw new NotFoundException('No parent record found for current user');
    }

    const enrichedStudents = await Promise.all(
      (parent.students || []).map(async (sp: any) => {
        const student = sp.student;
        const currentClassId = student?.classAssignments?.[0]?.class?.id;
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
          ...sp,
          student: {
            ...student,
            upcomingSessions,
            upcomingExams,
          },
        };
      }),
    );

    return {
      ...parent,
      students: enrichedStudents,
    };
  }

  async justifyAbsence(dto: { studentId?: string; attendanceId?: string; reason: string }, user: any) {
    if (!dto.reason) {
      throw new BadRequestException('Une justification est requise');
    }

    let record: any = null;
    if (dto.attendanceId) {
      record = await this.prisma.studentAttendance.update({
        where: { id: dto.attendanceId },
        data: {
          status: 'EXCUSED',
          reason: dto.reason,
        },
      });
    } else if (dto.studentId) {
      const recentAttendance = await this.prisma.studentAttendance.findFirst({
        where: {
          studentId: dto.studentId,
          status: 'ABSENT',
        },
        orderBy: { markedAt: 'desc' },
      });

      if (recentAttendance) {
        record = await this.prisma.studentAttendance.update({
          where: { id: recentAttendance.id },
          data: {
            status: 'EXCUSED',
            reason: dto.reason,
          },
        });
      }
    }

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [PARENT]`.trim()
      : 'Parent';

    await this.prisma.auditLog.create({
      data: {
        userId: user?.id,
        actorSnapshot,
        action: 'UPDATE',
        entity: 'StudentAttendance',
        entityId: record?.id || dto.attendanceId || dto.studentId || 'unknown',
        status: 'SUCCESS',
        newValues: { justified: true, reason: dto.reason } as any,
      },
    });

    return {
      success: true,
      message: "La justification d'absence a été transmise à la vie scolaire avec succès.",
      record,
    };
  }

  async sendMessage(dto: { subject: string; message: string; studentId?: string }, user: any) {
    if (!dto.subject || !dto.message) {
      throw new BadRequestException('Le sujet et le message sont requis');
    }

    const parent = await this.prisma.parent.findFirst({
      where: { userId: user.id },
      include: { establishment: true },
    });

    const establishmentId = parent?.establishmentId || user.establishmentId;
    let admins = establishmentId
      ? await this.prisma.user.findMany({
          where: {
            userRoles: {
              some: {
                establishmentId,
              },
            },
          },
          take: 5,
        })
      : [];

    if (admins.length === 0) {
      admins = await this.prisma.user.findMany({
        where: { isRoot: true },
        take: 3,
      });
    }

    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          title: `Message Parent: ${dto.subject}`,
          content: `${user.firstName || ''} ${user.lastName || ''}: ${dto.message}`,
          type: 'IN_APP',
        },
      });
    }

    return {
      success: true,
      message: "Votre message a été transmis à la direction de l'établissement.",
    };
  }

  async create(dto: CreateParentDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new Error('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    let userId = dto.userId || null;

    if (dto.email && !userId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const hashedPassword = await bcrypt.hash('Parent@123', 10);
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

        const parentRole = await this.prisma.role.findUnique({
          where: { name: 'PARENT' },
        });
        if (parentRole) {
          await this.prisma.userRoleAssignment.create({
            data: {
              userId: newUser.id,
              roleId: parentRole.id,
              establishmentId,
            },
          });
        }
      }
    }

    return this.prisma.parent.create({
      data: {
        establishmentId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        occupation: dto.occupation,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateParentDto) {
    const parent = await this.prisma.parent.findUnique({ where: { id } });
    if (!parent) throw new NotFoundException(`Parent with ID ${id} not found`);

    return this.prisma.parent.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        occupation: dto.occupation,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const parent = await this.prisma.parent.findUnique({ where: { id } });
    if (!parent) throw new NotFoundException(`Parent with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.parent.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Parent',
            entityId: id,
            status: 'SUCCESS',
            oldValues: parent as any,
          },
        });
        return { message: 'Parent permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Parent ${id}: ${err.message}`,
            stack: err.stack,
            context: 'ParentsService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete parent. Dependent student links exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.parent.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'Parent',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      return { message: 'Parent deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of Parent ${id}: ${err.message}`,
          stack: err.stack,
          context: 'ParentsService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
