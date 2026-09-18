import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LandingService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.saaSPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        modules: {
          include: { module: { select: { id: true, name: true, description: true } } },
        },
        features: true,
      },
    });
  }

  async getModules() {
    return this.prisma.saaSModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getStats() {
    const [tenants, users, students, teachers] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.student.count(),
      this.prisma.teacher.count(),
    ]);

    return {
      tenants,
      users,
      students,
      teachers,
      establishments: tenants,
    };
  }

  async getFeatures() {
    return this.prisma.saaSPlanFeature.findMany({
      include: {
        plan: { select: { id: true, name: true } },
      },
    });
  }
}
