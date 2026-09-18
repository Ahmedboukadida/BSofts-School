import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeContractDto, UpdateEmployeeContractDto, QueryEmployeeContractDto } from './employee-contract.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class EmployeeContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryEmployeeContractDto) {
    const { page = 1, limit = 10, search, employeeId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.employeeContract.findMany({
        where, skip, take: limit, orderBy,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, position: true } },
        },
      }),
      this.prisma.employeeContract.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const contract = await this.prisma.employeeContract.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, email: true, position: true } },
      },
    });
    if (!contract) throw new NotFoundException(`EmployeeContract with ID ${id} not found`);
    return contract;
  }

  async create(dto: CreateEmployeeContractDto) {
    return this.prisma.employeeContract.create({
      data: {
        employeeId: dto.employeeId,
        type: dto.type as any,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        salary: dto.salary,
        currency: dto.currency ?? 'DZD',
        description: dto.description,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeContractDto) {
    const contract = await this.prisma.employeeContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException(`EmployeeContract with ID ${id} not found`);

    return this.prisma.employeeContract.update({
      where: { id },
      data: {
        type: dto.type as any,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        salary: dto.salary,
        currency: dto.currency,
        isActive: dto.isActive,
        description: dto.description,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    const contract = await this.prisma.employeeContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException(`EmployeeContract with ID ${id} not found`);
    await this.prisma.employeeContract.update({ where: { id }, data: { isActive: false } });
    return { message: 'EmployeeContract deactivated successfully' };
  }
}
