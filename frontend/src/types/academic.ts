import { Class } from './class';
import { Teacher } from './teacher';
import { BaseAuditItem } from './system';

export interface AcademicYear {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface AcademicPeriod {
  id: string;
  name: string;
  code?: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
  academicYear?: AcademicYear;
  isCurrent?: boolean;
}

export interface AcademicModule {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  matieres?: Matiere[];
}

export interface Matiere {
  id: string;
  name: string;
  code?: string;
  coefficient: number;
  maxScore: number;
  description?: string;
  isActive: boolean;
  moduleId?: string;
  academicModule?: AcademicModule;
}

export interface MatiereItem {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  maxScore: number;
  weeklyHours: number;
  evaluationMode: 'EXAMEN_ET_CC' | 'CONTROLE_CONTINU' | 'PRATIQUE_TP';
  isActive: boolean;
}

export interface AcademicModuleItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  filiere: string;
  description: string;
  totalCoefficient: number;
  matieresCount: number;
  matieres: MatiereItem[];
  isActive: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  classId: string;
  matiereId: string;
  teacherId: string;
  date?: string;
  class?: Class;
  matiere?: Matiere;
  teacher?: Teacher;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  matiereId: string;
  teacherId: string;
  assignedDate: string;
  dueDate: string;
  attachmentUrl?: string;
  class?: Class;
  matiere?: Matiere;
  teacher?: Teacher;
  submissionsCount?: number;
}

export interface HomeworkItem extends BaseAuditItem {
  id: string;
  title: string;
  description: string;
  className: string;
  matiereName: string;
  assignedDate: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
  status: 'OPEN' | 'SUBMITTED' | 'GRADED' | 'EXPIRED';
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  content?: string;
  attachmentUrl?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface ScheduleSessionItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  topic?: string;
  notes?: string;
  class: { id: string; name: string };
  teacher?: { id: string; firstName: string; lastName: string };
  room?: { id: string; name: string };
  lessons?: { matiere?: { id: string; name: string; code?: string } }[];
}

export interface NoteItem {
  id: string;
  matiere: string;
  coefficient: number;
  continuousScore: number;
  examScore: number;
  average: number;
  appreciation: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
}
