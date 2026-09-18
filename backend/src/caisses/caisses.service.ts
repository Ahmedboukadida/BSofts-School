import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaisseDto, UpdateCaisseDto, QueryCaisseDto } from './caisse.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { CaisseEntity } from './caisse.entity';

@Injectable()
export class CaissesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCaisseDto) {
    const { page = 1, limit = 10, search, establishmentId, type, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (type) where.type = type;
    if (!query.includeDeleted) {
      where.isActive = true;
    }
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { name: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.caisse.findMany({
        where, skip, take: limit, orderBy,
        include: { _count: { select: { transactions: true } } },
      }),
      this.prisma.caisse.count({ where }),
    ]);

    const entities = data.map((item) => new CaisseEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const caisse = await this.prisma.caisse.findUnique({
      where: { id },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!caisse) throw new NotFoundException(`Caisse with ID ${id} not found`);
    return new CaisseEntity(caisse as any);
  }

  async create(dto: CreateCaisseDto) {
    const created = await this.prisma.caisse.create({
      data: {
        establishmentId: dto.establishmentId,
        name: dto.name,
        type: dto.type as any,
        balance: dto.balance ?? 0,
        currency: dto.currency,
        description: dto.description,
      },
    });
    return new CaisseEntity(created as any);
  }

  async update(id: string, dto: UpdateCaisseDto) {
    const caisse = await this.prisma.caisse.findUnique({ where: { id } });
    if (!caisse) throw new NotFoundException(`Caisse with ID ${id} not found`);

    const updated = await this.prisma.caisse.update({
      where: { id },
      data: { name: dto.name, description: dto.description, isActive: dto.isActive },
    });
    return new CaisseEntity(updated as any);
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const caisse = await this.prisma.caisse.findUnique({ where: { id } });
    if (!caisse) throw new NotFoundException(`Caisse with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.caisse.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Caisse',
            entityId: id,
            status: 'SUCCESS',
            oldValues: caisse as any,
          },
        });
        return { message: 'Caisse permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Caisse ${id}: ${err.message}`,
            stack: err.stack,
            context: 'CaissesService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete caisse. Dependent transactions exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.caisse.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'Caisse',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      return { message: 'Caisse deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of Caisse ${id}: ${err.message}`,
          stack: err.stack,
          context: 'CaissesService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async getBalance(id: string) {
    const caisse = await this.prisma.caisse.findUnique({ where: { id } });
    if (!caisse) throw new NotFoundException(`Caisse with ID ${id} not found`);
    return { id: caisse.id, name: caisse.name, balance: caisse.balance, currency: caisse.currency };
  }
}
