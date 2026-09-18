import { AcademicYear } from './academic';
import { StudentClassAssignment } from './student';
import { BaseAuditItem } from './system';

export interface ClassLevel {
  id: string;
  name: string;
  code?: string;
  orderIndex?: number;
  cycle?: 'PRIMARY' | 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'KINDERGARTEN';
}

export interface Class {
  id: string;
  name: string;
  code?: string;
  capacity: number;
  classLevelId?: string;
  academicYearId?: string;
  classLevel?: ClassLevel;
  academicYear?: AcademicYear;
  studentCount?: number;
  studentClassAssignments?: StudentClassAssignment[];
}

export interface ClassItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  level: string;
  academicYear: string;
  academicYearId?: string;
  roomName?: string;
  mainTeacherName?: string;
  studentsCount: number;
  capacity: number;
  isActive: boolean;
}

export interface ClassOption {
  id: string;
  name: string;
}

export interface SessionOption {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
}

export interface ClassFormData {
  name: string;
  code: string;
  capacity: number;
  classLevelId: string;
  academicYearId: string;
}

export interface ClassStudentItem {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  status: string;
}
