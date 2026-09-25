import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDynamicEnumDto, UpdateDynamicEnumDto, QueryDynamicEnumDto } from './dynamic-enum.dto';

@Injectable()
export class DynamicEnumsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryDynamicEnumDto, establishmentId?: string) {
    const estId = query.establishmentId || establishmentId;
    const where: any = {};

    if (estId && estId !== 'ALL' && estId !== 'all') {
      where.establishmentId = estId;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.dynamicEnum.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { labelFr: 'asc' }],
    });
  }

  async findByCategory(category: string, establishmentId?: string) {
    const where: any = { category, isActive: true };
    if (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all') {
      where.establishmentId = establishmentId;
    }
    return this.prisma.dynamicEnum.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { labelFr: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.dynamicEnum.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`DynamicEnum with ID ${id} not found`);
    return item;
  }

  async create(dto: CreateDynamicEnumDto, establishmentId?: string, actor?: any) {
    const estId = dto.establishmentId || establishmentId;
    if (!estId) {
      throw new BadRequestException('Establishment context is required to create a dynamic enum.');
    }

    const existing = await this.prisma.dynamicEnum.findUnique({
      where: {
        establishmentId_category_code: {
          establishmentId: estId,
          category: dto.category,
          code: dto.code,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`Enum with code '${dto.code}' already exists in category '${dto.category}'.`);
    }

    const created = await this.prisma.dynamicEnum.create({
      data: {
        establishmentId: estId,
        category: dto.category,
        code: dto.code,
        labelFr: dto.labelFr,
        labelEn: dto.labelEn,
        labelAr: dto.labelAr,
        color: dto.color || '#4F46E5',
        sortOrder: dto.sortOrder || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    if (actor?.id) {
      await this.prisma.auditLog.create({
        data: {
          userId: actor.id,
          actorSnapshot: `${actor.firstName || ''} ${actor.lastName || ''} (@${actor.username || actor.email || ''}) [${actor.isRoot ? 'ROOT' : 'ADMIN'}]`.trim(),
          action: 'CREATE',
          entity: 'DynamicEnum',
          entityId: created.id,
          status: 'SUCCESS',
          newValues: created as unknown as Prisma.InputJsonValue,
        },
      }).catch(() => {});
    }

    return created;
  }

  async update(id: string, dto: UpdateDynamicEnumDto, actor?: any) {
    const existing = await this.prisma.dynamicEnum.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`DynamicEnum with ID ${id} not found`);

    const updated = await this.prisma.dynamicEnum.update({
      where: { id },
      data: {
        labelFr: dto.labelFr,
        labelEn: dto.labelEn,
        labelAr: dto.labelAr,
        color: dto.color,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });

    if (actor?.id) {
      await this.prisma.auditLog.create({
        data: {
          userId: actor.id,
          actorSnapshot: `${actor.firstName || ''} ${actor.lastName || ''} (@${actor.username || actor.email || ''}) [${actor.isRoot ? 'ROOT' : 'ADMIN'}]`.trim(),
          action: 'UPDATE',
          entity: 'DynamicEnum',
          entityId: id,
          status: 'SUCCESS',
          oldValues: existing as unknown as Prisma.InputJsonValue,
          newValues: updated as unknown as Prisma.InputJsonValue,
        },
      }).catch(() => {});
    }

    return updated;
  }

  async remove(id: string, actor?: any) {
    const existing = await this.prisma.dynamicEnum.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`DynamicEnum with ID ${id} not found`);

    const updated = await this.prisma.dynamicEnum.update({
      where: { id },
      data: { isActive: false },
    });

    if (actor?.id) {
      await this.prisma.auditLog.create({
        data: {
          userId: actor.id,
          actorSnapshot: `${actor.firstName || ''} ${actor.lastName || ''} (@${actor.username || actor.email || ''}) [${actor.isRoot ? 'ROOT' : 'ADMIN'}]`.trim(),
          action: 'SOFT_DELETE',
          entity: 'DynamicEnum',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      }).catch(() => {});
    }

    return { message: 'Enum deactivated successfully', item: updated };
  }
}
