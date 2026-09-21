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

    // Find or verify module
    let moduleId = dto.moduleId;
    if (!moduleId && dto.module) {
      const mod = await this.prisma.saaSModule.findFirst({
        where: {
          OR: [
            { name: { contains: dto.module, mode: 'insensitive' } },
            { code: { contains: dto.module.toLowerCase().replace(/[^a-z0-9]/g, '_'), mode: 'insensitive' } },
          ],
        },
      });
      if (mod) {
        moduleId = mod.id;
      } else {
        const fallback = await this.prisma.saaSModule.findFirst();
        moduleId = fallback?.id || '';
      }
    }

    if (!moduleId) {
      throw new NotFoundException('Valid moduleId or module name is required');
    }

    const permission = await this.prisma.saaSPermission.create({
      data: {
        moduleId: moduleId as string,
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
      include: {
        module: true,
      },
    });

    if (dto.roles && Array.isArray(dto.roles) && dto.roles.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: { code: { in: dto.roles } },
      });
      if (roles.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: roles.map((r) => ({
            roleId: r.id,
            permissionId: permission.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.findOne(permission.id);
  }

  async update(id: string, dto: any) {
    const permission = await this.prisma.saaSPermission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    const dataToUpdate: any = {};
    if (dto.name) dataToUpdate.name = dto.name;
    if (dto.description !== undefined) dataToUpdate.description = dto.description;

    if (Object.keys(dataToUpdate).length > 0) {
      await this.prisma.saaSPermission.update({
        where: { id },
        data: dataToUpdate,
      });
    }

    if (dto.roles && Array.isArray(dto.roles)) {
      await this.prisma.rolePermission.deleteMany({ where: { permissionId: id } });
      const roles = await this.prisma.role.findMany({
        where: { code: { in: dto.roles } },
      });
      if (roles.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: roles.map((r) => ({
            roleId: r.id,
            permissionId: id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.findOne(id);
  }

  async restore(id: string) {
    const permission = await this.prisma.saaSPermission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return this.findOne(id);
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
