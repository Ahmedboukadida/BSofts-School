import { BaseAuditItem } from './system';

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  participants?: ConversationParticipant[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  userName?: string;
  userRole?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  senderName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface MeetingItem extends BaseAuditItem {
  id: string;
  title: string;
  type: 'PARENT_TEACHER' | 'CLASS_COUNCIL' | 'PEDAGOGICAL' | 'ADMINISTRATIVE';
  roomType: 'VIRTUAL' | 'PRESENTIAL';
  locationOrUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  participantsCount: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  agenda: string;
}

export interface MessageThread extends BaseAuditItem {
  id: string;
  subject: string;
  senderName: string;
  senderRole: 'TEACHER' | 'PARENT' | 'ADMIN' | 'STUDENT';
  recipientName: string;
  recipientGroup?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  isArchived: boolean;
}

export interface NotificationItem extends BaseAuditItem {
  id: string;
  title: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP';
  targetAudience: string;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  status: 'SENT' | 'PENDING' | 'SCHEDULED' | 'FAILED';
  scheduledAt?: string;
  sentAt: string;
  content: string;
}
