import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLoginLogDto } from './login-log.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class LoginLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryLoginLogDto) {
    const { page = 1, limit = 10, userId, success, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (success !== undefined) where.success = success;

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.loginLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.loginLog.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findByUser(userId: string) {
    return this.prisma.loginLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const total = await this.prisma.loginLog.count({ where });
    const successful = await this.prisma.loginLog.count({
      where: { ...where, success: true },
    });
    const failed = await this.prisma.loginLog.count({
      where: { ...where, success: false },
    });

    return { total, successful, failed };
  }
}
