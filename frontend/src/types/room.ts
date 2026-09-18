import { BaseAuditItem } from './system';

export interface Room {
  id: string;
  name: string;
  code?: string;
  capacity: number;
  type: 'CLASSROOM' | 'LAB' | 'SPORTS' | 'LIBRARY' | 'AMPHITHEATER';
  building?: string;
  floor?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface RoomItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  type: 'CLASSROOM' | 'LABORATORY' | 'LIBRARY' | 'GYM' | 'AUDITORIUM' | 'COMPUTER_LAB' | 'ART_ROOM' | 'MUSIC_ROOM' | 'OTHER';
  capacity: number;
  floor?: number | string;
  building?: string;
  description?: string;
  equipment?: string[];
  isActive: boolean;
  establishmentId?: string;
  establishmentName?: string;
}

export interface RoomFormData {
  name: string;
  code: string;
  capacity: number;
  type: 'CLASSROOM' | 'LAB' | 'SPORTS' | 'LIBRARY' | 'AMPHITHEATER';
  building?: string;
  floor?: number;
}
