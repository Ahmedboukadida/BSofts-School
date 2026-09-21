import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, QueryRoomDto } from './room.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { RoomEntity } from './room.entity';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryRoomDto) {
    const { page = 1, limit = 50, search, establishmentId, type, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all') {
      where.establishmentId = establishmentId;
    }
    if (type) where.type = type;
    if (!query.includeDeleted) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { name: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          establishment: { select: { id: true, name: true, slug: true } },
          _count: { select: { equipment: true, sessions: true } },
        },
      }),
      this.prisma.room.count({ where }),
    ]);

    const entities = data.map((item) => new RoomEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        equipment: true,
        sessions: { take: 5, orderBy: { date: 'desc' } },
      },
    });
    if (!room) throw new NotFoundException(`Room with ID ${id} not found`);
    return room;
  }

  async create(dto: CreateRoomDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new Error('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    return this.prisma.room.create({
      data: {
        establishmentId,
        name: dto.name,
        code: dto.code,
        type: dto.type as any,
        capacity: dto.capacity,
        floor: dto.floor,
        building: dto.building,
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException(`Room with ID ${id} not found`);

    return this.prisma.room.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        capacity: dto.capacity,
        floor: dto.floor,
        building: dto.building,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException(`Room with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.room.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Room',
            entityId: id,
            status: 'SUCCESS',
            oldValues: room as any,
          },
        });
        return { message: 'Room permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Room ${id}: ${err.message}`,
            stack: err.stack,
            context: 'RoomsService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete room. Dependent sessions exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.room.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'Room',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      return { message: 'Room deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of Room ${id}: ${err.message}`,
          stack: err.stack,
          context: 'RoomsService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async restore(id: string, user?: any) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException(`Room with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    const restored = await this.prisma.room.update({
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
        entity: 'Room',
        entityId: id,
        status: 'SUCCESS',
        oldValues: { isActive: false },
        newValues: { isActive: true },
      },
    });

    return { message: 'Salle restaurée avec succès', room: restored };
  }
}
