import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignPermissionDto } from './role-permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(private prisma: PrismaService) {}

  async assign(dto: AssignPermissionDto) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException(`Role with ID ${dto.roleId} not found`);

    // Validate all permission IDs exist
    const permissions = await this.prisma.saaSPermission.findMany({
      where: { id: { in: dto.permissionIds } },
    });

    if (permissions.length !== dto.permissionIds.length) {
      throw new NotFoundException('One or more permission IDs are invalid');
    }

    // Remove existing permissions for this role
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: dto.roleId },
    });

    // Assign new permissions
    const rolePermissions = await this.prisma.rolePermission.createMany({
      data: dto.permissionIds.map((permissionId) => ({
        roleId: dto.roleId,
        permissionId,
      })),
    });

    return { message: 'Permissions assigned successfully', count: rolePermissions.count };
  }

  async findByRole(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          include: {
            module: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });
  }

  async findByPermission(permissionId: string) {
    return this.prisma.rolePermission.findMany({
      where: { permissionId },
      include: {
        role: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async remove(roleId: string, permissionId: string) {
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
    });

    if (!rolePermission) {
      throw new NotFoundException('Role-Permission assignment not found');
    }

    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });

    return { message: 'Permission removed from role successfully' };
  }
}
