import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user context');
    }

    // ROOT user bypasses all permission checks
    if (user.isRoot) {
      return true;
    }

    const establishmentId = request.establishmentId || user.establishmentId || user.roles?.[0]?.establishmentId;

    // Get user's role permissions for this establishment (or global role assignments)
    const userRoles = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId: user.id,
        ...(establishmentId
          ? {
              OR: [
                { establishmentId },
                { establishmentId: null },
              ],
            }
          : {}),
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Collect all permission codes
    const userPermissions = new Set<string>();
    for (const userRole of userRoles) {
      for (const rp of userRole.role.permissions) {
        userPermissions.add(rp.permission.code);
      }
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Missing permissions: ${requiredPermissions.filter((p) => !userPermissions.has(p)).join(', ')}`,
      );
    }

    return true;
  }
}
