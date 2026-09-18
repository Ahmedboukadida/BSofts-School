import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHolidayDto, UpdateHolidayDto, QueryHolidayDto } from './holiday.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { HolidayEntity } from './holiday.entity';

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryHolidayDto) {
    const { page = 1, limit = 10, search, establishmentId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { startDate: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.holiday.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.holiday.count({ where }),
    ]);

    const entities = data.map((item) => new HolidayEntity(item));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const holiday = await this.prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException(`Holiday with ID ${id} not found`);
    return new HolidayEntity(holiday);
  }

  async create(dto: CreateHolidayDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    try {
      const created = await this.prisma.holiday.create({
        data: {
          establishmentId,
          name: dto.name,
          description: dto.description,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          isRecurring: dto.isRecurring ?? false,
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
          entity: 'Holiday',
          entityId: created.id,
          status: 'SUCCESS',
          newValues: created as any,
        },
      });

      return new HolidayEntity(created);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to create holiday: ${err.message}`,
          stack: err.stack,
          context: 'HolidaysService.create',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async update(id: string, dto: UpdateHolidayDto, user?: any) {
    const holiday = await this.prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException(`Holiday with ID ${id} not found`);

    try {
      const updated = await this.prisma.holiday.update({
        where: { id },
        data: {
          name: dto.name,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          description: dto.description,
          isRecurring: dto.isRecurring,
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
          entity: 'Holiday',
          entityId: id,
          status: 'SUCCESS',
          oldValues: holiday as any,
          newValues: updated as any,
        },
      });

      return new HolidayEntity(updated);
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to update holiday ${id}: ${err.message}`,
          stack: err.stack,
          context: 'HolidaysService.update',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async remove(id: string, isPermanent: boolean = false, user?: any) {
    const holiday = await this.prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException(`Holiday with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
      : 'System';

    if (isPermanent) {
      const isRoot = user?.role === 'ROOT' || user?.isRoot === true;
      if (!isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.holiday.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Holiday',
            entityId: id,
            status: 'SUCCESS',
            oldValues: holiday as any,
          },
        });
        return { message: 'Holiday permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Holiday ${id}: ${err.message}`,
            stack: err.stack,
            context: 'HolidaysService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete holiday: ${err.message}`);
      }
    }

    try {
      await this.prisma.holiday.delete({ where: { id } });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'DELETE',
          entity: 'Holiday',
          entityId: id,
          status: 'SUCCESS',
          oldValues: holiday as any,
        },
      });
      return { message: 'Holiday deleted successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed delete of Holiday ${id}: ${err.message}`,
          stack: err.stack,
          context: 'HolidaysService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }
}
