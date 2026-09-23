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

export type MeetingType = 'GENERAL' | 'PARENT_TEACHER' | 'STAFF' | 'DISCIPLINE' | 'PEDAGOGICAL' | 'BOARD' | 'CLASS_COUNCIL' | 'ADMINISTRATIVE';
export type MeetingMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ParticipantRole = 'HOST' | 'MODERATOR' | 'PRESENTER' | 'ATTENDEE';
export type ParticipantStatus = 'INVITED' | 'CONFIRMED' | 'ATTENDED' | 'DECLINED' | 'ABSENT';

export interface MeetingParticipantItem {
  id: string;
  meetingId: string;
  userId?: string;
  name: string;
  email: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
  token?: string;
  handRaised?: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface MeetingVoteItem {
  id: string;
  pointId: string;
  participantId: string;
  value: 'YES' | 'NO' | 'ABSTAIN';
  createdAt: string;
}

export interface MeetingPointItem {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  status?: string;
  sortOrder: number;
  isVote: boolean;
  votes?: MeetingVoteItem[];
}

export interface MeetingDocumentItem {
  id: string;
  meetingId: string;
  title: string;
  fileUrl: string;
  fileType?: string;
  sizeBytes?: number;
  uploadedAt: string;
}

export interface MeetingItem extends BaseAuditItem {
  id: string;
  subject: string;
  title?: string;
  type: MeetingType;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  mode: MeetingMode;
  roomType?: 'VIRTUAL' | 'PRESENTIAL';
  location: string;
  locationOrUrl?: string;
  description?: string;
  agenda?: string;
  establishmentId?: string;
  createdById?: string;
  organizer?: string;
  participantsCount?: number;
  status: MeetingStatus;
  roomName?: string;
  isOnline?: boolean;
  summary?: string;
  participants?: MeetingParticipantItem[];
  points?: MeetingPointItem[];
  documents?: MeetingDocumentItem[];
  _count?: {
    participants: number;
    points: number;
    documents: number;
  };
  establishment?: {
    id: string;
    name: string;
    slug?: string;
  };
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
