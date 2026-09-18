import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto, UpdateTeacherDto, QueryTeacherDto } from './teacher.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { TeacherEntity } from './teacher.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTeacherDto) {
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
      this.prisma.teacher.findMany({
        where, skip, take: limit, orderBy,
        include: {
          matieres: { include: { matiere: { select: { id: true, name: true } } } },
          contracts: { where: { isActive: true }, take: 1 },
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    const entities = data.map((item) => new TeacherEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        matieres: { include: { matiere: true } },
        contracts: { orderBy: { createdAt: 'desc' } },
        sessions: { take: 5 },
      },
    });
    if (!teacher) throw new NotFoundException(`Teacher with ID ${id} not found`);
    return teacher;
  }

  async findMe(user: any) {
    if (!user) throw new NotFoundException('User not authenticated');

    let teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.id },
      include: {
        establishment: { select: { id: true, name: true, slug: true, email: true, phone: true } },
        matieres: {
          include: {
            matiere: { select: { id: true, name: true, code: true, coefficient: true } },
          },
        },
        sessions: {
          include: {
            class: { select: { id: true, name: true } },
            room: { select: { id: true, name: true } },
            schedule: { include: { matiere: { select: { id: true, name: true, code: true } } } },
          },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          take: 50,
        },
        contracts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!teacher && (user.isRoot || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      teacher = await this.prisma.teacher.findFirst({
        where: user.establishmentId ? { establishmentId: user.establishmentId, isActive: true } : { isActive: true },
        include: {
          establishment: { select: { id: true, name: true, slug: true, email: true, phone: true } },
          matieres: {
            include: {
              matiere: { select: { id: true, name: true, code: true, coefficient: true } },
            },
          },
          sessions: {
            include: {
              class: { select: { id: true, name: true } },
              room: { select: { id: true, name: true } },
              schedule: { include: { matiere: { select: { id: true, name: true, code: true } } } },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
            take: 50,
          },
          contracts: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    if (!teacher) {
      throw new NotFoundException('No teacher record found for current user');
    }

    return teacher;
  }

  async create(dto: CreateTeacherDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    let userId = dto.userId || null;

    if (dto.email && !userId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const hashedPassword = await bcrypt.hash('Teacher@123', 10);
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

        const teacherRole = await this.prisma.role.findUnique({
          where: { name: 'TEACHER' },
        });
        if (teacherRole) {
          await this.prisma.userRoleAssignment.create({
            data: {
              userId: newUser.id,
              roleId: teacherRole.id,
              establishmentId,
            },
          });
        }
      }
    }

    return this.prisma.teacher.create({
      data: {
        establishmentId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        photo: dto.photo,
        specialization: dto.specialization,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new NotFoundException(`Teacher with ID ${id} not found`);

    return this.prisma.teacher.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        photo: dto.photo,
        specialization: dto.specialization,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new NotFoundException(`Teacher with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.teacher.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Teacher',
            entityId: id,
            status: 'SUCCESS',
            oldValues: teacher as any,
          },
        });
        return { message: 'Teacher permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Teacher ${id}: ${err.message}`,
            stack: err.stack,
            context: 'TeachersService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete teacher. Dependent sessions or grades exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.teacher.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'Teacher',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      return { message: 'Teacher deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of Teacher ${id}: ${err.message}`,
          stack: err.stack,
          context: 'TeachersService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
