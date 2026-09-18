import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherContractDto, UpdateTeacherContractDto, QueryTeacherContractDto } from './teacher-contract.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class TeacherContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTeacherContractDto) {
    const { page = 1, limit = 10, search, teacherId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { teacher: { firstName: { contains: search, mode: 'insensitive' } } },
        { teacher: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.teacherContract.findMany({
        where, skip, take: limit, orderBy,
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { payments: true } },
        },
      }),
      this.prisma.teacherContract.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const contract = await this.prisma.teacherContract.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { payments: true } },
      },
    });
    if (!contract) throw new NotFoundException(`TeacherContract with ID ${id} not found`);
    return contract;
  }

  async create(dto: CreateTeacherContractDto) {
    return this.prisma.teacherContract.create({
      data: {
        teacherId: dto.teacherId,
        contractType: dto.contractType as any,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        salary: dto.salary,
        currency: dto.currency ?? 'DZD',
        hourlyRate: dto.hourlyRate,
        monthlyHours: dto.monthlyHours,
        description: dto.description,
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, dto: UpdateTeacherContractDto) {
    const contract = await this.prisma.teacherContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException(`TeacherContract with ID ${id} not found`);

    return this.prisma.teacherContract.update({
      where: { id },
      data: {
        contractType: dto.contractType as any,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        salary: dto.salary,
        currency: dto.currency,
        hourlyRate: dto.hourlyRate,
        monthlyHours: dto.monthlyHours,
        isActive: dto.isActive,
        description: dto.description,
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    const contract = await this.prisma.teacherContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException(`TeacherContract with ID ${id} not found`);
    await this.prisma.teacherContract.update({ where: { id }, data: { isActive: false } });
    return { message: 'TeacherContract deactivated successfully' };
  }
}
