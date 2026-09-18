import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto, QueryAuditLogDto } from './audit-log.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { AuditLogEntity } from './audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryAuditLogDto) {
    const { page = 1, limit = 20, userId, entity, action } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const entities = data.map((item) => new AuditLogEntity(item));
    return new PaginatedDto(entities, total, page, limit);
  }

  async log(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        actorSnapshot: dto.actorSnapshot,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        status: dto.status || 'SUCCESS',
        oldValues: dto.oldValues,
        newValues: dto.newValues,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
    });
  }
}
