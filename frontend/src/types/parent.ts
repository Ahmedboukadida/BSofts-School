import { Student } from './student';
import { BaseAuditItem } from './system';

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship?: 'FATHER' | 'MOTHER' | 'GUARDIAN';
  address?: string;
  profession?: string;
  workplace?: string;
  emergencyPhone?: string;
  establishmentId?: string;
  students?: Student[];
  childrenCount?: number;
}

export interface LinkedStudent {
  id: string;
  name: string;
  matricule: string;
  className: string;
}

export interface ParentItem extends BaseAuditItem {
  id: string;
  cin: string;
  firstName: string;
  lastName: string;
  profession: string;
  phone: string;
  phoneSecondary?: string;
  email: string;
  address: string;
  city: string;
  linkedStudents: LinkedStudent[];
  emergencyContact: string;
  portalAccess: boolean;
  isActive: boolean;
  establishmentName?: string;
}

export interface ParentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN';
  address: string;
  profession: string;
  workplace: string;
  emergencyPhone: string;
}

export interface ParentPortalChild {
  id: string;
  name: string;
  class: string;
  generalAverage: number;
  unjustifiedAbsences: number;
  tuitionStatus: 'UP_TO_DATE' | 'LATE' | 'OVERDUE';
}

export interface ChildOverview {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  className: string;
  school: string;
  average: number;
  attendanceRate: number;
  unjustifiedAbsences: number;
  tuitionTotal: number;
  tuitionPaid: number;
  tuitionRemaining: number;
}

export interface SubjectScore {
  id: string;
  matiere: string;
  coefficient: number;
  continuousScore: number;
  examScore: number;
  average: number;
  appreciation: string;
}

export interface AttendanceLog {
  id: string;
  date: string;
  subject: string;
  time: string;
  status: 'PRESENT' | 'ABSENT_JUSTIFIED' | 'ABSENT_UNJUSTIFIED' | 'LATE';
  reason?: string;
}
