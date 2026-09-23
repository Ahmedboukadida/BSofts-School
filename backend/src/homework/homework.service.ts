import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHomeworkDto, UpdateHomeworkDto, QueryHomeworkDto } from './homework.dto';
import { PaginatedDto } from '../common/dto/pagination.dto';
import { HomeworkEntity } from './homework.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class HomeworkService {
  // In-memory persistent store with rich seed data for Tunisian curriculum
  private items: HomeworkEntity[] = [
    new HomeworkEntity({
      id: 'hw-1',
      title: 'Série d’exercices N°1 : Équations Différentielles & Primitives',
      description: 'Résoudre les problèmes 12 à 25 sur le fascicule de Mathématiques. Préparation au devoir surveillé du trimestre.',
      className: '4-MATH (Bac)',
      matiereName: 'Mathématiques',
      assignedDate: '2026-09-12',
      dueDate: '2026-09-18',
      submissionsCount: 29,
      totalStudents: 32,
      status: 'OPEN',
      createdAt: '2026-09-12T08:00:00.000Z',
      createdBy: 'u-root',
      createdByName: 'Ahmed Zitouni (@root) [ROOT]',
      updatedAt: '2026-09-14T10:00:00.000Z',
      updatedBy: 'u-prof1',
      updatedByName: 'Moncef Trabelsi (@trabelsi) [TEACHER]',
      isDeleted: false,
    }),
    new HomeworkEntity({
      id: 'hw-2',
      title: 'Dissertation : Les Lumières et la critique sociale au XVIIIe siècle',
      description: 'Rédiger une introduction problématisée et un plan détaillé en 3 parties avec exemples littéraires.',
      className: '4-SC-EXP (Bac)',
      matiereName: 'Français',
      assignedDate: '2026-09-14',
      dueDate: '2026-09-21',
      submissionsCount: 26,
      totalStudents: 30,
      status: 'OPEN',
      createdAt: '2026-09-14T09:00:00.000Z',
      createdBy: 'u-root',
      createdByName: 'Ahmed Zitouni (@root) [ROOT]',
      updatedAt: '2026-09-14T09:00:00.000Z',
      isDeleted: false,
    }),
    new HomeworkEntity({
      id: 'hw-3',
      title: 'Compte-rendu de Travaux Pratiques : Circuit RLC en Régime Forcé',
      description: 'Tracer les courbes de résonance d’intensité et calculer le facteur de surtension sur papier millimétré.',
      className: '4-MATH (Bac)',
      matiereName: 'Sciences Physiques',
      assignedDate: '2026-09-15',
      dueDate: '2026-09-22',
      submissionsCount: 31,
      totalStudents: 32,
      status: 'OPEN',
      createdAt: '2026-09-15T10:30:00.000Z',
      createdBy: 'u-root',
      createdByName: 'Ahmed Zitouni (@root) [ROOT]',
      updatedAt: '2026-09-15T10:30:00.000Z',
      isDeleted: false,
    }),
  ];

  constructor(private readonly prisma: PrismaService) {}

  private getActorSnapshot(user?: any): string {
    if (!user) return 'System';
    const parts = [
      user.firstName,
      user.lastName,
      user.username || user.email ? `(@${user.username || user.email})` : '',
      user.role ? `[${user.role}]` : (user.isRoot ? '[ROOT]' : ''),
    ].filter(Boolean);
    return parts.join(' ').trim() || 'User';
  }

  async findAll(query: QueryHomeworkDto, user?: any): Promise<PaginatedDto<HomeworkEntity>> {
    const { page = 1, limit = 10, search, status, className } = query;
    const includeDeleted = query.includeDeleted ?? query.isDeleted;

    let filtered = this.items.filter((item) => {
      // Soft-delete filter
      if (!includeDeleted && item.isDeleted) return false;
      if (includeDeleted && !item.isDeleted) return false;

      // Status filter
      if (status && item.status !== status) return false;

      // Class name filter
      if (className && item.className !== className) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesClass = item.className.toLowerCase().includes(q);
        const matchesMatiere = item.matiereName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesClass && !matchesMatiere) return false;
      }

      return true;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return new PaginatedDto(paginated, total, page, limit);
  }

  async findOne(id: string): Promise<HomeworkEntity> {
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      throw new NotFoundException(`Homework item with ID ${id} not found`);
    }
    return item;
  }

  async create(dto: CreateHomeworkDto, user?: any): Promise<HomeworkEntity> {
    const now = new Date().toISOString();
    const actorSnapshot = this.getActorSnapshot(user);

    const newItem = new HomeworkEntity({
      id: `hw-${randomUUID()}`,
      title: dto.title,
      description: dto.description || '',
      className: dto.className || '4-MATH (Bac)',
      matiereName: dto.matiereName || 'Général',
      assignedDate: dto.assignedDate || now.split('T')[0],
      dueDate: dto.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      submissionsCount: 0,
      totalStudents: dto.totalStudents || 30,
      status: dto.status || 'OPEN',
      establishmentId: dto.establishmentId || user?.establishmentId,
      classId: dto.classId,
      matiereId: dto.matiereId,
      createdAt: now,
      createdBy: user?.id || 'system',
      createdByName: actorSnapshot,
      updatedAt: now,
      updatedBy: user?.id || 'system',
      updatedByName: actorSnapshot,
      isDeleted: false,
    });

    this.items.unshift(newItem);

    // Write to audit logs non-blockingly
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'CREATE',
          entity: 'Homework',
          entityId: newItem.id,
          status: 'SUCCESS',
          newValues: newItem as any,
        },
      });
    } catch {
      // Non-blocking audit log
    }

    return newItem;
  }

  async update(id: string, dto: UpdateHomeworkDto, user?: any): Promise<HomeworkEntity> {
    const item = await this.findOne(id);
    const actorSnapshot = this.getActorSnapshot(user);
    const now = new Date().toISOString();

    if (dto.title !== undefined) item.title = dto.title;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.className !== undefined) item.className = dto.className;
    if (dto.matiereName !== undefined) item.matiereName = dto.matiereName;
    if (dto.assignedDate !== undefined) item.assignedDate = dto.assignedDate;
    if (dto.dueDate !== undefined) item.dueDate = dto.dueDate;
    if (dto.totalStudents !== undefined) item.totalStudents = dto.totalStudents;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.isDeleted !== undefined) item.isDeleted = dto.isDeleted;

    item.updatedAt = now;
    item.updatedBy = user?.id || item.updatedBy;
    item.updatedByName = actorSnapshot;

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'UPDATE',
          entity: 'Homework',
          entityId: item.id,
          status: 'SUCCESS',
          newValues: item as any,
        },
      });
    } catch {
      // Non-blocking
    }

    return item;
  }

  async remove(id: string, permanent: boolean = false, user?: any): Promise<{ message: string }> {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new NotFoundException(`Homework item with ID ${id} not found`);
    }

    const item = this.items[index];
    const actorSnapshot = this.getActorSnapshot(user);
    const isRoot = user?.isRoot || user?.role === 'ROOT';

    if (permanent) {
      if (!isRoot) {
        throw new ForbiddenException('Only ROOT administrators can permanently delete records');
      }
      this.items.splice(index, 1);

      try {
        await this.prisma.auditLog.create({
          data: {
            userId: user?.id,
            actorSnapshot,
            action: 'DELETE_PERMANENT',
            entity: 'Homework',
            entityId: id,
            status: 'SUCCESS',
            oldValues: item as any,
          },
        });
      } catch {
        // Non-blocking
      }

      return { message: 'Homework permanently deleted' };
    }

    // Soft delete
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    item.deletedBy = user?.id;
    item.updatedAt = item.deletedAt;
    item.updatedBy = user?.id;
    item.updatedByName = actorSnapshot;

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'DELETE',
          entity: 'Homework',
          entityId: id,
          status: 'SUCCESS',
          oldValues: item as any,
        },
      });
    } catch {
      // Non-blocking
    }

    return { message: 'Homework moved to trash (soft-deleted)' };
  }

  async restore(id: string, user?: any): Promise<HomeworkEntity> {
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      throw new NotFoundException(`Homework item with ID ${id} not found`);
    }

    item.isDeleted = false;
    item.deletedAt = undefined;
    item.deletedBy = undefined;
    item.updatedAt = new Date().toISOString();
    item.updatedBy = user?.id;
    item.updatedByName = this.getActorSnapshot(user);

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot: item.updatedByName,
          action: 'RESTORE',
          entity: 'Homework',
          entityId: id,
          status: 'SUCCESS',
          newValues: item as any,
        },
      });
    } catch {
      // Non-blocking
    }

    return item;
  }
}
