import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicPeriodDto, UpdateAcademicPeriodDto, QueryAcademicPeriodDto } from './academic-period.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class AcademicPeriodsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryAcademicPeriodDto) {
    const { page = 1, limit = 10, search, academicYearId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { sortOrder: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.academicPeriod.findMany({
        where, skip, take: limit, orderBy,
        include: {
          academicYear: { select: { id: true, name: true } },
          _count: { select: { notes: true, exams: true } },
        },
      }),
      this.prisma.academicPeriod.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const period = await this.prisma.academicPeriod.findUnique({
      where: { id },
      include: {
        academicYear: { select: { id: true, name: true } },
        notes: { take: 5 },
        exams: { take: 5 },
      },
    });
    if (!period) throw new NotFoundException(`Academic Period with ID ${id} not found`);
    return period;
  }

  async create(dto: CreateAcademicPeriodDto) {
    return this.prisma.academicPeriod.create({
      data: {
        academicYearId: dto.academicYearId,
        name: dto.name,
        type: dto.type as any,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isCurrent: dto.isCurrent ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateAcademicPeriodDto) {
    const period = await this.prisma.academicPeriod.findUnique({ where: { id } });
    if (!period) throw new NotFoundException(`Academic Period with ID ${id} not found`);

    return this.prisma.academicPeriod.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        isCurrent: dto.isCurrent,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: string) {
    const period = await this.prisma.academicPeriod.findUnique({ where: { id } });
    if (!period) throw new NotFoundException(`Academic Period with ID ${id} not found`);
    await this.prisma.academicPeriod.delete({ where: { id } });
    return { message: 'Academic Period deleted successfully' };
  }
}
