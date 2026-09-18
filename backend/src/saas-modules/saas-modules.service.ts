import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaaSModuleDto, UpdateSaaSModuleDto, QuerySaaSModuleDto } from './saas-module.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class SaaSModulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySaaSModuleDto) {
    const { page = 1, limit = 10, search, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.sortOrder = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.saaSModule.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { permissions: true, plans: true },
          },
        },
      }),
      this.prisma.saaSModule.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const module = await this.prisma.saaSModule.findUnique({
      where: { id },
      include: {
        permissions: true,
        plans: {
          include: {
            plan: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`SaaS Module with ID ${id} not found`);
    }

    return module;
  }

  async create(dto: CreateSaaSModuleDto) {
    const existing = await this.prisma.saaSModule.findFirst({
      where: { OR: [{ name: dto.name }, { code: dto.code }] },
    });

    if (existing) {
      throw new ConflictException('Module name or code already exists');
    }

    return this.prisma.saaSModule.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateSaaSModuleDto) {
    const module = await this.prisma.saaSModule.findUnique({ where: { id } });
    if (!module) {
      throw new NotFoundException(`SaaS Module with ID ${id} not found`);
    }

    return this.prisma.saaSModule.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: string) {
    const module = await this.prisma.saaSModule.findUnique({
      where: { id },
      include: {
        _count: { select: { permissions: true } },
      },
    });

    if (!module) {
      throw new NotFoundException(`SaaS Module with ID ${id} not found`);
    }

    if (module._count.permissions > 0) {
      throw new ConflictException('Cannot delete module with assigned permissions');
    }

    await this.prisma.saaSModule.delete({ where: { id } });
    return { message: 'Module deleted successfully' };
  }
}
