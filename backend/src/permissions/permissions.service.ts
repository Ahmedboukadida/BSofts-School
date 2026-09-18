import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto, UpdatePermissionDto, QueryPermissionDto } from './permission.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { SaaSPermission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPermissionDto): Promise<PaginatedDto<SaaSPermission>> {
    const { page = 1, limit = 10, search, moduleId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (moduleId) where.moduleId = moduleId;
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
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.saaSPermission.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          module: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
      }),
      this.prisma.saaSPermission.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const permission = await this.prisma.saaSPermission.findUnique({
      where: { id },
      include: {
        module: true,
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async create(dto: CreatePermissionDto) {
    // Check if code already exists
    const existingPermission = await this.prisma.saaSPermission.findUnique({
      where: { code: dto.code },
    });

    if (existingPermission) {
      throw new ConflictException('Permission code already exists');
    }

    // Verify module exists
    const module = await this.prisma.saaSModule.findUnique({
      where: { id: dto.moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${dto.moduleId} not found`);
    }

    const permission = await this.prisma.saaSPermission.create({
      data: {
        moduleId: dto.moduleId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
      include: {
        module: true,
      },
    });

    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.prisma.saaSPermission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    const updatedPermission = await this.prisma.saaSPermission.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
      include: {
        module: true,
      },
    });

    return updatedPermission;
  }

  async remove(id: string) {
    const permission = await this.prisma.saaSPermission.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    if (permission._count.rolePermissions > 0) {
      throw new ConflictException('Cannot delete permission with assigned roles');
    }

    await this.prisma.saaSPermission.delete({ where: { id } });

    return { message: 'Permission deleted successfully' };
  }

  async findByModule(moduleCode: string) {
    const module = await this.prisma.saaSModule.findUnique({
      where: { code: moduleCode },
    });

    if (!module) {
      throw new NotFoundException(`Module with code ${moduleCode} not found`);
    }

    return this.prisma.saaSPermission.findMany({
      where: { moduleId: module.id },
      orderBy: { name: 'asc' },
    });
  }
}
