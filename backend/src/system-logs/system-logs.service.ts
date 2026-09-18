import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSystemLogDto, QuerySystemLogDto } from './system-log.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { SystemLogEntity } from './system-log.entity';

@Injectable()
export class SystemLogsService {
  private readonly logger = new Logger(SystemLogsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySystemLogDto): Promise<PaginatedDto<SystemLogEntity>> {
    const { page = 1, limit = 20, level, context, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (level) where.level = level;
    if (context) where.context = context;
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { path: { contains: search, mode: 'insensitive' } },
        { context: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.systemLog.count({ where }),
    ]);

    const entities = data.map((item) => new SystemLogEntity(item));
    return new PaginatedDto(entities, total, page, limit);
  }

  async log(dto: CreateSystemLogDto): Promise<SystemLogEntity> {
    try {
      const record = await this.prisma.systemLog.create({
        data: {
          level: dto.level || 'ERROR',
          message: dto.message,
          stack: dto.stack,
          context: dto.context,
          path: dto.path,
          method: dto.method,
          statusCode: dto.statusCode,
          userId: dto.userId,
          ipAddress: dto.ipAddress,
        },
      });
      return new SystemLogEntity(record);
    } catch (err: any) {
      this.logger.error(`Failed to write SystemLog to database: ${err.message}`);
      return new SystemLogEntity({
        id: 'fallback',
        level: dto.level,
        message: dto.message,
        stack: dto.stack || null,
        context: dto.context || null,
        path: dto.path || null,
        method: dto.method || null,
        statusCode: dto.statusCode || null,
        userId: dto.userId || null,
        ipAddress: dto.ipAddress || null,
        createdAt: new Date(),
      });
    }
  }

  async clearOldLogs(days = 30): Promise<{ deleted: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.systemLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return { deleted: result.count };
  }
}
