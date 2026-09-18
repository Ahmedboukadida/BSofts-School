import { Class } from './class';
import { Matiere } from './academic';
import { BaseAuditItem } from './system';

export interface TeacherContract {
  id?: string;
  type: 'CDI' | 'CDD' | 'VACATAIRE' | 'HONORAIRE';
  salary?: number;
  hourlyRate?: number;
  weeklyHours?: number;
  startDate?: string;
  endDate?: string;
}

export interface TeacherMatiereAssignment {
  id?: string;
  teacherId?: string;
  matiereId: string;
  matiere?: Matiere;
}

export interface TeacherClassAssignment {
  id?: string;
  teacherId?: string;
  classId: string;
  class?: Class;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  photo?: string;
  specialization?: string;
  degree?: string;
  hireDate?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  establishmentId?: string;
  contracts?: TeacherContract[];
  matieres?: TeacherMatiereAssignment[];
  classes?: TeacherClassAssignment[];
  bio?: string;
}

export interface TeacherItem extends BaseAuditItem {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  specialization: string;
  diploma: string;
  assignedClasses: string[];
  weeklyHours: number;
  email: string;
  phone: string;
  hireDate: string;
  isActive: boolean;
  establishmentName?: string;
}

export interface StudentGradeRow {
  studentId: string;
  name: string;
  registrationNumber: string;
  continuousScore: number;
  examScore: number;
  appreciation: string;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  address: string;
  photo: string;
  specialization: string;
  degree: string;
  contractType: 'CDI' | 'CDD' | 'VACATAIRE' | 'HONORAIRE';
  salary: number;
  hourlyRate: number;
  weeklyHours: number;
  hireDate: string;
  selectedMatieres: string[];
  selectedClasses: string[];
  bio: string;
}

export interface TeacherLeave {
  id: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  teacher?: Teacher;
}
