import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassLevelDto, UpdateClassLevelDto, QueryClassLevelDto } from './class-level.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class ClassLevelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryClassLevelDto) {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { sortOrder: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.classLevel.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { _count: { select: { classes: true } } },
      }),
      this.prisma.classLevel.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const level = await this.prisma.classLevel.findUnique({
      where: { id },
      include: {
        classes: { select: { id: true, name: true, code: true } },
        _count: { select: { classes: true } },
      },
    });
    if (!level) throw new NotFoundException(`ClassLevel with ID ${id} not found`);
    return level;
  }

  async create(dto: CreateClassLevelDto) {
    const existing = await this.prisma.classLevel.findFirst({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('ClassLevel name already exists');

    return this.prisma.classLevel.create({
      data: {
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateClassLevelDto) {
    const level = await this.prisma.classLevel.findUnique({ where: { id } });
    if (!level) throw new NotFoundException(`ClassLevel with ID ${id} not found`);

    if (dto.name && dto.name !== level.name) {
      const existing = await this.prisma.classLevel.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (existing) throw new ConflictException('ClassLevel name already exists');
    }

    return this.prisma.classLevel.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: string) {
    const level = await this.prisma.classLevel.findUnique({ where: { id } });
    if (!level) throw new NotFoundException(`ClassLevel with ID ${id} not found`);
    await this.prisma.classLevel.delete({ where: { id } });
    return { message: 'ClassLevel deleted successfully' };
  }
}
