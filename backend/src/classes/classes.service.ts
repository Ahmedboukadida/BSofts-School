import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, UpdateClassDto, QueryClassDto } from './class.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { ClassEntity } from './class.entity';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryClassDto) {
    const { page = 1, limit = 10, search, establishmentId, academicYearId, classLevelId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (classLevelId) where.classLevelId = classLevelId;
    if (!query.includeDeleted) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { name: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({
        where, skip, take: limit, orderBy,
        include: {
          classLevel: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true } },
          _count: { select: { studentClassAssignments: true, sessions: true } },
        },
      }),
      this.prisma.class.count({ where }),
    ]);

    const entities = data.map((item) => new ClassEntity(item as any));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        classLevel: true,
        academicYear: true,
        gradingConfig: true,
        studentClassAssignments: {
          include: { student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } } },
        },
        moduleAssignments: {
          include: { module: { select: { id: true, name: true } } },
        },
        _count: { select: { studentClassAssignments: true, sessions: true } },
      },
    });
    if (!cls) throw new NotFoundException(`Class with ID ${id} not found`);
    return cls;
  }

  async create(dto: CreateClassDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required (provide in body or ensure user has an establishment)');
    }

    const existing = await this.prisma.class.findFirst({
      where: { establishmentId, academicYearId: dto.academicYearId, name: dto.name },
    });
    if (existing) throw new ConflictException('Class name already exists for this establishment and year');

    return this.prisma.class.create({
      data: {
        establishmentId,
        classLevelId: dto.classLevelId,
        academicYearId: dto.academicYearId,
        name: dto.name,
        code: dto.code,
        periodType: dto.periodType as any,
        maxStudents: dto.maxStudents ?? 30,
        gradingConfigId: dto.gradingConfigId,
      },
      include: {
        classLevel: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, dto: UpdateClassDto) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException(`Class with ID ${id} not found`);

    return this.prisma.class.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        maxStudents: dto.maxStudents,
        isActive: dto.isActive,
        gradingConfigId: dto.gradingConfigId,
      },
      include: {
        classLevel: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, isPermanent = false, user?: any) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException(`Class with ID ${id} not found`);

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.isRoot ? 'ROOT' : 'ADMIN'}]`.trim()
      : null;

    if (isPermanent) {
      if (!user?.isRoot) {
        throw new BadRequestException('Permanent deletion is restricted to ROOT administrators.');
      }
      try {
        await this.prisma.class.delete({ where: { id } });
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'PERMANENT_DELETE',
            entity: 'Class',
            entityId: id,
            status: 'SUCCESS',
            oldValues: cls as any,
          },
        });
        return { message: 'Class permanently deleted from database' };
      } catch (err: any) {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Failed permanent delete of Class ${id}: ${err.message}`,
            stack: err.stack,
            context: 'ClassesService.remove',
            userId: user?.id,
          },
        });
        throw new BadRequestException(`Cannot permanently delete class. Dependent records exist: ${err.message}`);
      }
    }

    // Soft delete
    try {
      await this.prisma.class.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'SOFT_DELETE',
          entity: 'Class',
          entityId: id,
          status: 'SUCCESS',
          oldValues: { isActive: true },
          newValues: { isActive: false },
        },
      });
      return { message: 'Class deactivated successfully' };
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed soft delete of Class ${id}: ${err.message}`,
          stack: err.stack,
          context: 'ClassesService.remove',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async promoteClass(
    fromClassId: string,
    targetClassId: string,
    targetAcademicYearId: string,
    user?: any,
  ) {
    const fromClass = await this.prisma.class.findUnique({
      where: { id: fromClassId },
      include: {
        academicYear: true,
        studentClassAssignments: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
          },
        },
      },
    });
    if (!fromClass) throw new NotFoundException(`Classe source avec ID ${fromClassId} introuvable`);

    const targetClass = await this.prisma.class.findUnique({
      where: { id: targetClassId },
    });
    if (!targetClass) throw new NotFoundException(`Classe cible avec ID ${targetClassId} introuvable`);

    // Fetch the latest bulletins or academic records for this class
    const latestBulletins = await this.prisma.bulletin.findMany({
      where: { classId: fromClassId },
      orderBy: { generatedAt: 'desc' },
    });

    const bulletinsMap = new Map<string, any>();
    for (const b of latestBulletins) {
      if (!bulletinsMap.has(b.studentId)) {
        bulletinsMap.set(b.studentId, b);
      }
    }

    const processedRecords = [];

    for (const assignment of fromClass.studentClassAssignments) {
      const studentId = assignment.studentId;
      const bulletin = bulletinsMap.get(studentId);
      const isPromoted = bulletin ? bulletin.isPromoted : false;
      const averageScore = bulletin ? Number(bulletin.averageScore) : 0;
      const reason = isPromoted
        ? `Admis vers ${targetClass.name} (Moyenne: ${averageScore.toFixed(2)}/20)`
        : `Non promu / Redoublement (Moyenne: ${averageScore.toFixed(2)}/20)`;

      // Create or update GraduationRecord
      const gradRecord = await this.prisma.graduationRecord.upsert({
        where: {
          studentId_academicYearId: {
            studentId,
            academicYearId: fromClass.academicYearId,
          },
        },
        update: {
          fromClassId,
          toClassId: isPromoted ? targetClassId : fromClassId,
          averageScore,
          isPromoted,
          reason,
          processedBy: user?.userId || 'SYSTEM',
          processedAt: new Date(),
        },
        create: {
          studentId,
          academicYearId: fromClass.academicYearId,
          fromClassId,
          toClassId: isPromoted ? targetClassId : fromClassId,
          averageScore,
          isPromoted,
          reason,
          processedBy: user?.userId || 'SYSTEM',
        },
      });

      // Update the previous assignment status
      await this.prisma.studentClassAssignment.update({
        where: { id: assignment.id },
        data: { isPromoted },
      });

      // If promoted, automatically assign student to target class in target academic year
      if (isPromoted) {
        await this.prisma.studentClassAssignment.upsert({
          where: {
            studentId_academicYearId: {
              studentId,
              academicYearId: targetAcademicYearId,
            },
          },
          update: {
            classId: targetClassId,
            isPromoted: null,
          },
          create: {
            studentId,
            classId: targetClassId,
            academicYearId: targetAcademicYearId,
          },
        });
      }

      processedRecords.push({
        student: assignment.student,
        isPromoted,
        averageScore,
        targetClass: isPromoted ? targetClass.name : fromClass.name,
      });
    }

    return {
      message: `Passage de classe effectué: ${processedRecords.filter((p) => p.isPromoted).length} admis, ${processedRecords.filter((p) => !p.isPromoted).length} non admis`,
      processedCount: processedRecords.length,
      promotedCount: processedRecords.filter((p) => p.isPromoted).length,
      records: processedRecords,
    };
  }
}
