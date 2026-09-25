import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  MeetingType,
  MeetingMode,
  MeetingStatus,
  MeetingParticipantRole,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LivekitService } from '../livekit/livekit.service';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  QueryMeetingDto,
  JoinMeetingDto,
  VoteMeetingPointDto,
  HandRaiseDto,
} from './meeting.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly livekitService: LivekitService,
  ) {}

  async findAll(query: QueryMeetingDto, user?: any) {
    const { page = 1, limit = 20, search, establishmentId, status, type, startDate, endDate, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };

    // Tenant / Establishment Isolation
    const targetEstId = (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all')
      ? establishmentId
      : (!user?.isRoot ? user?.establishmentId : undefined);

    if (targetEstId) {
      where.establishmentId = targetEstId;
    }

    if (status) where.status = status;
    if (type) where.type = type;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { date: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          establishment: { select: { id: true, name: true, slug: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          _count: {
            select: { participants: true, points: true, documents: true },
          },
        },
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string, user?: any) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id, isDeleted: false },
      include: {
        establishment: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        points: {
          include: {
            votes: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!meeting) throw new NotFoundException(`Meeting with ID ${id} not found`);

    if (user && !user.isRoot && user.establishmentId && meeting.establishmentId !== user.establishmentId) {
      throw new ForbiddenException('Access denied to meeting outside your establishment');
    }

    return meeting;
  }

  async create(dto: CreateMeetingDto, user?: any) {
    const establishmentId = dto.establishmentId || user?.establishmentId;
    if (!establishmentId) {
      throw new BadRequestException('establishmentId is required to schedule a meeting');
    }

    const roomName = `school-room-${randomUUID().slice(0, 8)}`;
    const meetingDate = new Date(dto.date);

    const meeting = await this.prisma.meeting.create({
      data: {
        subject: dto.subject,
        type: (dto.type || 'GENERAL') as MeetingType,
        date: meetingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        duration: dto.duration || 60,
        mode: (dto.mode || 'ONLINE') as MeetingMode,
        location: dto.location || (dto.mode === 'IN_PERSON' ? 'Salle de réunion' : 'Visioconférence LiveKit'),
        description: dto.description,
        establishmentId,
        createdById: user?.id,
        roomName,
        isOnline: dto.mode !== 'IN_PERSON',
        participants: dto.participants?.length
          ? {
              create: dto.participants.map((p) => ({
                name: p.name,
                email: p.email,
                role: (p.role || 'ATTENDEE') as MeetingParticipantRole,
                userId: p.userId,
                token: randomUUID(),
              })),
            }
          : undefined,
        points: dto.points?.length
          ? {
              create: dto.points.map((pt, idx) => ({
                title: pt.title,
                description: pt.description,
                isVote: pt.isVote || false,
                sortOrder: pt.sortOrder !== undefined ? pt.sortOrder : idx + 1,
              })),
            }
          : undefined,
        documents: dto.documents?.length
          ? {
              create: dto.documents.map((d) => ({
                title: d.title,
                fileUrl: d.fileUrl,
                fileType: d.fileType,
                sizeBytes: d.sizeBytes,
              })),
            }
          : undefined,
      },
      include: {
        participants: true,
        points: true,
        documents: true,
      },
    });

    if (user?.id) {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          actorSnapshot: `${user.firstName || ''} ${user.lastName || ''} (@${user.email || user.username || 'unknown'}) [${user.role || 'USER'}]`.trim(),
          action: 'CREATE',
          entity: 'Meeting',
          entityId: meeting.id,
          status: 'SUCCESS',
          newValues: { subject: meeting.subject, date: meeting.date, roomName },
        },
      }).catch((e) => this.logger.warn(`Failed writing meeting audit log: ${e.message}`));
    }

    return meeting;
  }

  async update(id: string, dto: UpdateMeetingDto, user?: any) {
    const existing = await this.prisma.meeting.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) throw new NotFoundException(`Meeting with ID ${id} not found`);

    const data: Prisma.MeetingUpdateInput = {};
    if (dto.subject !== undefined) data.subject = dto.subject;
    if (dto.type !== undefined) data.type = dto.type as MeetingType;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.startTime !== undefined) data.startTime = dto.startTime;
    if (dto.endTime !== undefined) data.endTime = dto.endTime;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.mode !== undefined) {
      data.mode = dto.mode as MeetingMode;
      data.isOnline = dto.mode !== 'IN_PERSON';
    }
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status as MeetingStatus;
    if (dto.summary !== undefined) data.summary = dto.summary;

    const updated = await this.prisma.meeting.update({
      where: { id },
      data,
      include: {
        participants: true,
        points: true,
        documents: true,
      },
    });

    return updated;
  }

  async remove(id: string, user?: any) {
    const existing = await this.prisma.meeting.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) throw new NotFoundException(`Meeting with ID ${id} not found`);

    await this.prisma.meeting.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { success: true, message: 'Meeting archived successfully' };
  }

  async joinMeeting(id: string, dto: JoinMeetingDto, user?: any) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!meeting || meeting.isDeleted) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }

    let participant = null;

    if (dto.token) {
      participant = meeting.participants.find((p) => p.token === dto.token);
    } else if (user) {
      participant = meeting.participants.find((p) => p.userId === user.id || p.email.toLowerCase() === (user.email || '').toLowerCase());
    }

    // Auto-register user as participant if meeting allows attendees and user is authenticated
    if (!participant && user) {
      participant = await this.prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Utilisateur',
          email: user.email || `${user.username || 'user'}@school.tn`,
          role: (user.isRoot || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? 'MODERATOR' : 'ATTENDEE',
          status: 'ATTENDED',
          joinedAt: new Date(),
          token: randomUUID(),
        },
      });
    } else if (!participant && dto.guestName) {
      // Guest participant
      participant = await this.prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          name: dto.guestName,
          email: `guest_${randomUUID().slice(0, 6)}@guest.meeting`,
          role: 'ATTENDEE',
          status: 'ATTENDED',
          joinedAt: new Date(),
          token: randomUUID(),
        },
      });
    }

    if (!participant) {
      throw new BadRequestException('Participant token or authentication required to join this meeting');
    }

    // Mark attended
    await this.prisma.meetingParticipant.update({
      where: { id: participant.id },
      data: { status: 'ATTENDED', joinedAt: new Date() },
    });

    // If meeting was SCHEDULED, mark IN_PROGRESS
    if (meeting.status === 'SCHEDULED') {
      await this.prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Generate LiveKit token
    const tokenResult = await this.livekitService.generateToken({
      roomName: meeting.roomName,
      participantIdentity: participant.id,
      participantName: participant.name,
    });

    return {
      meeting: {
        id: meeting.id,
        subject: meeting.subject,
        roomName: meeting.roomName,
        status: meeting.status,
      },
      participant: {
        id: participant.id,
        name: participant.name,
        role: participant.role,
        email: participant.email,
        token: participant.token,
      },
      livekitToken: tokenResult.token,
      livekitUrl: tokenResult.url,
    };
  }

  async castVote(meetingId: string, pointId: string, dto: VoteMeetingPointDto) {
    const point = await this.prisma.meetingPoint.findUnique({
      where: { id: pointId },
      include: { meeting: true },
    });

    if (!point || point.meetingId !== meetingId) {
      throw new NotFoundException('Agenda point not found in this meeting');
    }

    if (!point.isVote) {
      throw new BadRequestException('This agenda point is not designated for voting');
    }

    const vote = await this.prisma.meetingVote.upsert({
      where: {
        pointId_participantId: {
          pointId,
          participantId: dto.participantId,
        },
      },
      update: {
        value: dto.value,
      },
      create: {
        pointId,
        participantId: dto.participantId,
        value: dto.value,
      },
    });

    const allVotes = await this.prisma.meetingVote.findMany({
      where: { pointId },
    });

    const summary = {
      yes: allVotes.filter((v) => v.value === 'YES').length,
      no: allVotes.filter((v) => v.value === 'NO').length,
      abstain: allVotes.filter((v) => v.value === 'ABSTAIN').length,
      total: allVotes.length,
    };

    return { vote, summary };
  }

  async toggleHandRaise(meetingId: string, dto: HandRaiseDto) {
    const participant = await this.prisma.meetingParticipant.findUnique({
      where: { id: dto.participantId },
    });

    if (!participant || participant.meetingId !== meetingId) {
      throw new NotFoundException('Participant not found in this meeting');
    }

    const updated = await this.prisma.meetingParticipant.update({
      where: { id: participant.id },
      data: { handRaised: dto.handRaised },
    });

    return { participantId: updated.id, handRaised: updated.handRaised };
  }
}
