import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, QueryConversationDto } from './conversation.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryConversationDto) {
    const { page = 1, limit = 10, type } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      participants: { some: { userId } },
    };
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where, skip, take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          participants: {
            include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!conversation) throw new NotFoundException(`Conversation with ID ${id} not found`);
    return conversation;
  }

  async create(dto: CreateConversationDto, creatorId: string) {
    const conversation = await this.prisma.conversation.create({
      data: {
        title: dto.title,
        type: dto.type as any,
        participants: {
          create: [
            { userId: creatorId },
            ...dto.participantIds.filter(id => id !== creatorId).map(id => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    return conversation;
  }

  async remove(id: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conversation) throw new NotFoundException(`Conversation with ID ${id} not found`);
    await this.prisma.conversation.delete({ where: { id } });
    return { message: 'Conversation deleted' };
  }
}
