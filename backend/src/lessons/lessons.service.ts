import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto, QueryLessonDto } from './lesson.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryLessonDto) {
    const { page = 1, limit = 10, search, sessionId, matiereId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (matiereId) where.matiereId = matiereId;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where, skip, take: limit, orderBy,
        include: {
          session: { select: { id: true, date: true, topic: true } },
          matiere: { select: { id: true, name: true } },
        },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { session: true, matiere: true },
    });
    if (!lesson) throw new NotFoundException(`Lesson with ID ${id} not found`);
    return lesson;
  }

  async create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        sessionId: dto.sessionId,
        matiereId: dto.matiereId,
        title: dto.title,
        content: dto.content,
        objectives: dto.objectives,
        resources: dto.resources,
        createdBy: dto.createdBy,
      },
    });
  }

  async update(id: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException(`Lesson with ID ${id} not found`);

    return this.prisma.lesson.update({
      where: { id },
      data: { title: dto.title, content: dto.content, objectives: dto.objectives, resources: dto.resources },
    });
  }

  async remove(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException(`Lesson with ID ${id} not found`);
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted' };
  }
}
