import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherLeaveDto, UpdateLeaveStatusDto, QueryTeacherLeaveDto } from './teacher-leave.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class TeacherLeavesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTeacherLeaveDto) {
    const { page = 1, limit = 10, teacherId, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.teacherLeave.findMany({
        where, skip, take: limit, orderBy,
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.teacherLeave.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const leave = await this.prisma.teacherLeave.findUnique({
      where: { id },
      include: { teacher: true },
    });
    if (!leave) throw new NotFoundException(`Teacher Leave with ID ${id} not found`);
    return leave;
  }

  async create(dto: CreateTeacherLeaveDto) {
    return this.prisma.teacherLeave.create({
      data: {
        teacherId: dto.teacherId,
        type: dto.type as any,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
      },
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async updateStatus(id: string, dto: UpdateLeaveStatusDto) {
    const leave = await this.prisma.teacherLeave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException(`Teacher Leave with ID ${id} not found`);

    return this.prisma.teacherLeave.update({
      where: { id },
      data: {
        status: dto.status as any,
        approvedBy: dto.approvedBy,
        approvedAt: dto.status === 'APPROVED' ? new Date() : null,
      },
    });
  }

  async remove(id: string) {
    const leave = await this.prisma.teacherLeave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException(`Teacher Leave with ID ${id} not found`);
    await this.prisma.teacherLeave.delete({ where: { id } });
    return { message: 'Teacher Leave deleted' };
  }
}
