import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignRoleDto, RemoveRoleDto } from './user-role.dto';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}

  async assign(dto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User with ID ${dto.userId} not found`);

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException(`Role with ID ${dto.roleId} not found`);

    // Check for duplicate assignment
    const existing = await this.prisma.userRoleAssignment.findFirst({
      where: {
        userId: dto.userId,
        roleId: dto.roleId,
        establishmentId: dto.establishmentId || null,
      },
    });

    if (existing) {
      throw new ConflictException('User already has this role');
    }

    const userRole = await this.prisma.userRoleAssignment.create({
      data: {
        userId: dto.userId,
        roleId: dto.roleId,
        establishmentId: dto.establishmentId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        role: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return userRole;
  }

  async findByUser(userId: string) {
    return this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: {
        role: {
          select: { id: true, name: true, code: true },
        },
        establishment: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByEstablishment(establishmentId: string) {
    return this.prisma.userRoleAssignment.findMany({
      where: { establishmentId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        role: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async remove(id: string) {
    const userRole = await this.prisma.userRoleAssignment.findUnique({ where: { id } });
    if (!userRole) throw new NotFoundException(`UserRole assignment with ID ${id} not found`);

    await this.prisma.userRoleAssignment.delete({ where: { id } });

    return { message: 'Role assignment removed successfully' };
  }

  async removeAllByUser(userId: string) {
    await this.prisma.userRoleAssignment.deleteMany({ where: { userId } });
    return { message: 'All role assignments removed for user' };
  }
}
