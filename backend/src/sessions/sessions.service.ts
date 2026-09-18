import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto, QuerySessionDto } from './session.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySessionDto) {
    const { page = 1, limit = 10, search, classId, teacherId, academicYearId, startDate, endDate, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) where.topic = { contains: search, mode: 'insensitive' };

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { date: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        where, skip, take: limit, orderBy,
        include: {
          class: { select: { id: true, name: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
          room: { select: { id: true, name: true } },
          lessons: {
            take: 1,
            include: {
              matiere: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
      this.prisma.session.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        class: true,
        period: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
        room: { select: { id: true, name: true } },
        attendances: { take: 5 },
        lessons: { take: 5, include: { matiere: true } },
      },
    });
    if (!session) throw new NotFoundException(`Session with ID ${id} not found`);
    return session;
  }

  async create(dto: CreateSessionDto) {
    const date = new Date(dto.date);
    
    // Resilient time parsing supporting "HH:mm", "HH:mm:ss", or ISO strings
    const parseDateTime = (dateStr: string, timeStr: string) => {
      if (!timeStr) return new Date();
      if (timeStr.includes('T')) return new Date(timeStr);
      const datePart = dateStr ? dateStr.split('T')[0] : new Date().toISOString().split('T')[0];
      const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
      return new Date(`${datePart}T${timePart}`);
    };

    const startTime = parseDateTime(dto.date, dto.startTime);
    const endTime = parseDateTime(dto.date, dto.endTime);

    let { academicYearId, periodId } = dto;
    if (!academicYearId || !periodId) {
      const cls = await this.prisma.class.findUnique({
        where: { id: dto.classId },
        include: { academicYear: { include: { periods: true } } },
      });
      if (cls) {
        academicYearId = academicYearId || cls.academicYearId;
        periodId = periodId || cls.academicYear?.periods?.[0]?.id;
      }
    }

    if (!academicYearId || !periodId) {
      throw new NotFoundException(`Année académique ou période introuvable pour la classe sélectionnée.`);
    }

    // Collision check 1: Room conflict
    if (dto.roomId) {
      const roomConflict = await this.prisma.session.findFirst({
        where: {
          roomId: dto.roomId,
          date,
          status: { not: 'CANCELLED' },
          OR: [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            { startTime: { gte: startTime }, endTime: { lte: endTime } },
          ],
        },
        include: { room: true },
      });
      if (roomConflict) {
        throw new ConflictException(`La salle "${roomConflict.room?.name || 'sélectionnée'}" est déjà réservée pour ce créneau.`);
      }
    }

    // Collision check 2: Teacher conflict
    if (dto.teacherId) {
      const teacherConflict = await this.prisma.session.findFirst({
        where: {
          teacherId: dto.teacherId,
          date,
          status: { not: 'CANCELLED' },
          OR: [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            { startTime: { gte: startTime }, endTime: { lte: endTime } },
          ],
        },
        include: { teacher: true },
      });
      if (teacherConflict) {
        throw new ConflictException(`L'enseignant "${teacherConflict.teacher?.firstName} ${teacherConflict.teacher?.lastName}" a déjà un cours sur ce créneau.`);
      }
    }

    // Collision check 3: Class conflict
    const classConflict = await this.prisma.session.findFirst({
      where: {
        classId: dto.classId,
        date,
        status: { not: 'CANCELLED' },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
      include: { class: true },
    });
    if (classConflict) {
      throw new ConflictException(`La classe "${classConflict.class.name}" a déjà une séance prévue sur ce créneau.`);
    }

    return this.prisma.session.create({
      data: {
        classId: dto.classId,
        periodId,
        academicYearId,
        date,
        startTime,
        endTime,
        topic: dto.topic,
        notes: dto.notes,
        teacherId: dto.teacherId,
        roomId: dto.roomId,
        scheduleId: dto.scheduleId,
      },
      include: {
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
        room: { select: { id: true, name: true } },
        lessons: {
          take: 1,
          include: { matiere: { select: { id: true, name: true, code: true } } },
        },
      },
    });
  }

  async update(id: string, dto: UpdateSessionDto) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Session with ID ${id} not found`);

    return this.prisma.session.update({
      where: { id },
      data: {
        topic: dto.topic,
        notes: dto.notes,
        status: dto.status as any,
        teacherId: dto.teacherId,
        roomId: dto.roomId,
      },
    });
  }

  async remove(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Session with ID ${id} not found`);
    await this.prisma.session.update({ where: { id }, data: { status: 'CANCELLED' } });
    return { message: 'Session cancelled successfully' };
  }
}
