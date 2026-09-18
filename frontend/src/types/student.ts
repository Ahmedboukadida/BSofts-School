import { Class } from './class';
import { Parent } from './parent';
import { AcademicYear } from './academic';
import { BaseAuditItem } from './system';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  photo?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  establishmentId?: string;
  className?: string;
  createdAt?: string;
  updatedAt?: string;
  classAssignments?: StudentClassAssignment[];
  parentRelations?: StudentParentRelation[];
}

export interface StudentItem extends BaseAuditItem {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  birthPlace: string;
  nationalId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  className: string;
  academicYear: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  tuitionDue: number; // in TND
  tuitionPaid: number; // in TND
  isActive: boolean;
  establishmentName?: string;
}

export interface StudentRosterItem {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  reason?: string;
}

export interface StudentClassAssignment {
  id: string;
  studentId: string;
  classId: string;
  academicYearId: string;
  isCurrent: boolean;
  status?: string;
  student?: Student;
  class?: Class;
  academicYear?: AcademicYear;
}

export interface StudentParentRelation {
  id: string;
  studentId: string;
  parentId: string;
  relationship: string;
  isEmergencyContact?: boolean;
  parent?: Parent;
  student?: Student;
}

export interface StudentDeliberation {
  studentId: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  averageScore: number;
  decision: 'PROMOTED' | 'RESCUED' | 'REPEATING' | 'GRADUATED';
  mention: string;
  remarks?: string;
}

export interface StudentPromotion {
  studentId: string;
  currentClassId: string;
  targetClassId: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  averageScore?: number;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  registrationNumber: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  photo: string;
  bloodGroup: string;
  medicalConditions: string;
  classId: string;
  parentId: string;
  relationship: string;
}
