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
        req.isRoot = true;
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
        return res.status(403).json({
          statusCode: 403,
          message: 'No tenant found for user',
          error: 'Forbidden',
        });
      }

      if (!tenant.subscriptions.length) {
        return res.status(403).json({
          statusCode: 403,
          message: 'No active subscription found for tenant',
          error: 'Forbidden',
        });
      }

      req.tenantId = tenant.id;
      next();
    } catch (error) {
      // Token verification failed or other unexpected errors - let JwtAuthGuard handle it downstream
      next();
    }
  }
}
