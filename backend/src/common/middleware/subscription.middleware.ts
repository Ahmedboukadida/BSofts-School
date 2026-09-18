import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SubscriptionMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    try {
      const token = authHeader.split(' ')[1];
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Check if user is ROOT
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { isRoot: true },
      });

      if (user?.isRoot) {
        (req as any).isRoot = true;
        return next();
      }

      // 1. Check if user is a Tenant owner with active subscription
      let tenant = await this.prisma.tenant.findUnique({
        where: { userId },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
        },
      });

      // 2. If user is not direct tenant owner, check if they belong to an establishment whose tenant has an active subscription
      if (!tenant) {
        const userAssignment = await this.prisma.userRoleAssignment.findFirst({
          where: { userId },
          include: {
            establishment: {
              include: {
                tenant: {
                  include: {
                    subscriptions: {
                      where: { status: 'ACTIVE' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        });

        if (userAssignment?.establishment?.tenant) {
          tenant = userAssignment.establishment.tenant;
        }
      }

      if (!tenant) {
        throw new ForbiddenException('No tenant found for user');
      }

      if (!tenant.subscriptions.length) {
        throw new ForbiddenException('No active subscription');
      }

      (req as any).tenantId = tenant.id;
      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Token verification failed or other errors - let JwtAuthGuard handle it
      next();
    }
  }
}
