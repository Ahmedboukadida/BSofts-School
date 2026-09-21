import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './employee.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { EmployeeEntity } from './employee.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryEmployeeDto) {
    const { page = 1, limit = 50, search, establishmentId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all') {
      where.establishmentId = establishmentId;
    }
    if (!query.includeDeleted) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          establishment: { select: { id: true, name: true, slug: true } },
          contracts: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    const entities = data.map((item) => new EmployeeEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        contracts: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
    return employee;
  }

  async create(dto: CreateEmployeeDto, user?: any) {
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
        const hashedPassword = await bcrypt.hash('Employee@123', 10);
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

        const employeeRole = await this.prisma.role.findUnique({
          where: { name: 'EMPLOYEE' },
        });
        if (employeeRole) {
          await this.prisma.userRoleAssignment.create({
            data: {
              userId: newUser.id,
              roleId: employeeRole.id,
              establishmentId,
            },
          });
        }
      }
    }

    return this.prisma.employee.create({
      data: {
        establishmentId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        position: dto.position,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);

    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        position: dto.position,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.employee.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Employee',
            entityId: id,
            status: 'SUCCESS',
            oldValues: employee as any,
          },
        });
        return { message: 'Employee permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Employee ${id}: ${err.message}`,
            stack: err.stack,
            context: 'EmployeesService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete employee. Dependent contracts or records exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.employee.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'Employee',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      return { message: 'Employee deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of Employee ${id}: ${err.message}`,
          stack: err.stack,
          context: 'EmployeesService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async restore(id: string, user?: any) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    const restored = await this.prisma.employee.update({
      where: { id },
      data: { isActive: true },
      include: {
        establishment: { select: { id: true, name: true, slug: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user?.id,
        actorSnapshot,
        action: 'RESTORE',
        entity: 'Employee',
        entityId: id,
        status: 'SUCCESS',
        oldValues: { isActive: false },
        newValues: { isActive: true },
      },
    });

    return { message: 'Collaborateur restauré avec succès', employee: restored };
  }
}
