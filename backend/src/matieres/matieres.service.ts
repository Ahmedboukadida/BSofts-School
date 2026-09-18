import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatiereDto, UpdateMatiereDto, QueryMatiereDto } from './matiere.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class MatieresService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMatiereDto) {
    const { page = 1, limit = 10, search, moduleId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (moduleId) where.moduleId = moduleId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { name: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.matiere.findMany({
        where, skip, take: limit, orderBy,
        include: {
          module: { select: { id: true, name: true } },
          _count: { select: { lessons: true, notes: true, exams: true } },
        },
      }),
      this.prisma.matiere.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const matiere = await this.prisma.matiere.findUnique({
      where: { id },
      include: {
        module: true,
        lessons: { take: 5 },
        teacherMatieres: {
          include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!matiere) throw new NotFoundException(`Matiere with ID ${id} not found`);
    return matiere;
  }

  async create(dto: CreateMatiereDto) {
    return this.prisma.matiere.create({
      data: {
        moduleId: dto.moduleId,
        name: dto.name,
        code: dto.code,
        coefficient: dto.coefficient ?? 1.0,
        maxScore: dto.maxScore ?? 20,
        description: dto.description,
      },
      include: { module: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, dto: UpdateMatiereDto) {
    const matiere = await this.prisma.matiere.findUnique({ where: { id } });
    if (!matiere) throw new NotFoundException(`Matiere with ID ${id} not found`);

    return this.prisma.matiere.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        coefficient: dto.coefficient,
        maxScore: dto.maxScore,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    const matiere = await this.prisma.matiere.findUnique({ where: { id } });
    if (!matiere) throw new NotFoundException(`Matiere with ID ${id} not found`);
    await this.prisma.matiere.delete({ where: { id } });
    return { message: 'Matiere deleted successfully' };
  }
}
