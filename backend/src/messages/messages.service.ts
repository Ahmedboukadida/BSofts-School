import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto, QueryMessageDto } from './message.dto';
import { PaginatedDto } from '../common/pagination.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMessageDto) {
    const { page = 1, limit = 50, conversationId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (conversationId) where.conversationId = conversationId;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    return new PaginatedDto(data, total, page, limit);
  }

  async send(dto: SendMessageDto, senderId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
      include: { participants: true },
    });
    if (!conversation) throw new NotFoundException(`Conversation with ID ${dto.conversationId} not found`);

    const isParticipant = conversation.participants.some(p => p.userId === senderId);
    if (!isParticipant) throw new ForbiddenException('You are not a participant of this conversation');

    return this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        type: (dto.type as any) || 'TEXT',
        fileUrl: dto.fileUrl,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });

    return { message: 'Messages marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    return { unreadCount: count };
  }
}
