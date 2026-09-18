import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto, QueryAcademicYearDto } from './academic-year.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryAcademicYearDto) {
    const { page = 1, limit = 10, search, establishmentId, isCurrent, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (isCurrent !== undefined) where.isCurrent = isCurrent;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.startDate = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.academicYear.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          establishment: { select: { id: true, name: true } },
          _count: { select: { periods: true, classes: true } },
        },
      }),
      this.prisma.academicYear.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id },
      include: {
        establishment: { select: { id: true, name: true } },
        periods: { orderBy: { sortOrder: 'asc' } },
        classes: {
          include: { classLevel: { select: { id: true, name: true } } },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!year) throw new NotFoundException(`Academic Year with ID ${id} not found`);
    return year;
  }

  async create(dto: CreateAcademicYearDto) {
    const existing = await this.prisma.academicYear.findFirst({
      where: { establishmentId: dto.establishmentId, name: dto.name },
    });
    if (existing) throw new ConflictException('Academic year name already exists for this establishment');

    return this.prisma.academicYear.create({
      data: {
        establishmentId: dto.establishmentId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isCurrent: dto.isCurrent ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateAcademicYearDto) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) throw new NotFoundException(`Academic Year with ID ${id} not found`);

    // If setting as current, unset others
    if (dto.isCurrent === true) {
      await this.prisma.academicYear.updateMany({
        where: { establishmentId: year.establishmentId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        isCurrent: dto.isCurrent,
        isClosed: dto.isClosed,
      },
    });
  }

  async remove(id: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) throw new NotFoundException(`Academic Year with ID ${id} not found`);

    await this.prisma.academicYear.delete({ where: { id } });
    return { message: 'Academic Year deleted successfully' };
  }

  async setCurrent(id: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) throw new NotFoundException(`Academic Year with ID ${id} not found`);

    await this.prisma.academicYear.updateMany({
      where: { establishmentId: year.establishmentId },
      data: { isCurrent: false },
    });

    await this.prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true },
    });

    return { message: 'Academic Year set as current' };
  }
}
