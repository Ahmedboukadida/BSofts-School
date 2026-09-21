import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class EstablishmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any, user?: any) {
    const { page = 1, limit = 10, search, tenantId, isActive, sortBy, sortOrder, includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    const isRoot = user?.isRoot || user?.role === 'ROOT';
    if (!isRoot && user?.tenantId) {
      where.tenantId = user.tenantId;
    } else if (tenantId && tenantId !== 'ALL' && tenantId !== 'all' && tenantId !== 'undefined' && tenantId !== 'null') {
      where.tenantId = tenantId;
    }

    if (isActive !== undefined) {
      where.isActive = typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
    } else if (includeDeleted) {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tenant: {
            select: { id: true, user: { select: { firstName: true, lastName: true } } },
          },
          _count: {
            select: { classes: true, students: true, teachers: true },
          },
        },
      }),
      this.prisma.establishment.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { id: true, user: { select: { firstName: true, lastName: true } } },
        },
        classes: {
          select: { id: true, name: true, code: true },
          take: 10,
        },
        userRoles: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            role: { select: { name: true } },
          },
          take: 10,
        },
        configs: { take: 1 },
      },
    });

    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    return establishment;
  }

  async create(dto: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException(`Tenant with ID ${dto.tenantId} not found`);

    let baseSlug = (dto.slug || dto.code || dto.name || 'etablissement')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = 'etablissement';

    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.establishment.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.establishment.create({
      data: {
        name: dto.name,
        slug,
        category: dto.category || 'HIGH_SCHOOL',
        country: dto.country || 'TN',
        timezone: dto.timezone || 'Africa/Tunis',
        email: dto.email || null,
        phone: dto.phone || null,
        address: dto.address || null,
        logo: dto.logo || null,
        website: dto.website || null,
        isActive: dto.isActive ?? true,
        tenantId: dto.tenantId,
      },
      include: {
        tenant: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async update(id: string, dto: any) {
    const establishment = await this.prisma.establishment.findUnique({ where: { id } });
    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    return this.prisma.establishment.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        category: dto.category,
        country: dto.country,
        timezone: dto.timezone,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        logo: dto.logo,
        website: dto.website,
        isActive: dto.isActive,
      },
      include: {
        tenant: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async remove(id: string, permanent = false) {
    const establishment = await this.prisma.establishment.findUnique({ where: { id } });
    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    if (permanent) {
      await this.prisma.establishment.delete({ where: { id } });
      return { message: 'Establishment permanently deleted' };
    }

    // Soft delete / deactivation
    await this.prisma.establishment.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Establishment deactivated successfully' };
  }

  async restore(id: string) {
    const establishment = await this.prisma.establishment.findUnique({ where: { id } });
    if (!establishment) {
      throw new NotFoundException(`Establishment with ID ${id} not found`);
    }

    return this.prisma.establishment.update({
      where: { id },
      data: { isActive: true },
      include: {
        tenant: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }
}

