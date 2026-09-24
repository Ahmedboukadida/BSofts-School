import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { CreateAcademicModuleDto, UpdateAcademicModuleDto, QueryAcademicModuleDto } from './academic-module.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { AcademicModuleEntity } from './academic-module.entity';

@Injectable()
export class AcademicModulesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async findAll(query: QueryAcademicModuleDto) {
    const { page = 1, limit = 10, search, establishmentId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.buildKey(null, establishmentId, 'academic-modules', query);
    const cached = await this.cacheService.get<PaginatedDto<AcademicModuleEntity>>(cacheKey);
    if (cached) return cached;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
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
      this.prisma.academicModule.findMany({
        where, skip, take: limit, orderBy,
        include: {
          matieres: {
            where: { isActive: true },
            select: { id: true, name: true, code: true, coefficient: true, maxScore: true },
            orderBy: { name: 'asc' },
          },
          _count: { select: { matieres: true, classAssignments: true } },
        },
      }),
      this.prisma.academicModule.count({ where }),
    ]);

    const entities = data.map((item) => new AcademicModuleEntity(item as any));
    const result = new PaginatedDto(entities, total, page, limit);
    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  async findOne(id: string) {
    const module = await this.prisma.academicModule.findUnique({
      where: { id },
      include: {
        matieres: { orderBy: { name: 'asc' } },
        classAssignments: {
          include: { class: { select: { id: true, name: true } } },
        },
      },
    });
    if (!module) throw new NotFoundException(`Academic Module with ID ${id} not found`);
    return module;
  }

  async create(dto: CreateAcademicModuleDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    const module = await this.prisma.academicModule.create({
      data: {
        establishmentId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
    });

    if (dto.matieres && Array.isArray(dto.matieres) && dto.matieres.length > 0) {
      await Promise.all(
        dto.matieres.map((m) =>
          this.prisma.matiere.create({
            data: {
              name: m.name,
              code: m.code || m.name.slice(0, 4).toUpperCase(),
              coefficient: m.coefficient || 1,
              maxScore: m.maxScore || 20,
              moduleId: module.id,
            },
          }),
        ),
      );
    }

    await this.cacheService.invalidateResource(null, establishmentId, 'academic-modules');
    return this.findOne(module.id);
  }

  async update(id: string, dto: UpdateAcademicModuleDto) {
    const module = await this.prisma.academicModule.findUnique({ where: { id } });
    if (!module) throw new NotFoundException(`Academic Module with ID ${id} not found`);

    const updated = await this.prisma.academicModule.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
    await this.cacheService.invalidateResource(null, module.establishmentId, 'academic-modules');
    return updated;
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const module = await this.prisma.academicModule.findUnique({ where: { id } });
    if (!module) throw new NotFoundException(`Academic Module with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.academicModule.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'AcademicModule',
            entityId: id,
            status: 'SUCCESS',
            oldValues: module as any,
          },
        });
        await this.cacheService.invalidateResource(null, module.establishmentId, 'academic-modules');
        return { message: 'Academic Module permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of AcademicModule ${id}: ${err.message}`,
            stack: err.stack,
            context: 'AcademicModulesService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete module. Dependent records exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.academicModule.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'AcademicModule',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      await this.cacheService.invalidateResource(null, module.establishmentId, 'academic-modules');
      return { message: 'Academic Module deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of AcademicModule ${id}: ${err.message}`,
          stack: err.stack,
          context: 'AcademicModulesService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async restore(id: string, user?: any) {
    const module = await this.prisma.academicModule.findUnique({ where: { id } });
    if (!module) throw new NotFoundException(`Academic Module with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    await this.prisma.academicModule.update({
      where: { id },
      data: { isActive: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user?.id,
        actorSnapshot,
        action: 'RESTORE',
        entity: 'AcademicModule',
        entityId: id,
        status: 'SUCCESS',
        oldValues: { isActive: false },
        newValues: { isActive: true },
      },
    });

    return { message: 'Academic Module restored successfully' };
  }
}
