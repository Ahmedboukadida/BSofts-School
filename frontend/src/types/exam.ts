import { Class } from './class';
import { Matiere, AcademicPeriod } from './academic';
import { Room } from './room';
import { Student } from './student';

export interface Exam {
  id: string;
  title: string;
  code?: string;
  type: 'CONTINUOUS_ASSESSMENT' | 'MIDTERM' | 'FINAL' | 'QUIZ';
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  classId: string;
  matiereId: string;
  roomId?: string;
  maxScore: number;
  coefficient?: number;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  class?: Class;
  matiere?: Matiere;
  room?: Room;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  examId: string;
  questionText: string;
  points: number;
  orderIndex: number;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  score?: number;
  submittedAt: string;
  status: 'SUBMITTED' | 'GRADED';
  student?: Student;
  answers?: ExamAnswer[];
}

export interface ExamAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answerText: string;
  pointsAwarded?: number;
}

export interface ExamItem {
  id: string;
  title: string;
  type: string;
  className: string;
  matiereName: string;
  date: string;
  status: string;
  maxScore: number;
}

export interface ExamFormData {
  title: string;
  code?: string;
  type: 'CONTINUOUS_ASSESSMENT' | 'MIDTERM' | 'FINAL' | 'QUIZ';
  date: string;
  startTime: string;
  endTime: string;
  classId: string;
  matiereId: string;
  roomId?: string;
  maxScore: number;
  coefficient: number;
}

export interface Note {
  id: string;
  studentId: string;
  matiereId: string;
  examId?: string;
  periodId: string;
  value: number;
  maxScore: number;
  coefficient: number;
  appreciation?: string;
  student?: Student;
  matiere?: Matiere;
  period?: AcademicPeriod;
}

export interface Bulletin {
  id: string;
  studentId: string;
  academicYearId: string;
  periodId: string;
  generalAverage: number;
  rank?: number;
  classAverage?: number;
  minAverage?: number;
  maxAverage?: number;
  decision?: string;
  appreciation?: string;
  grades?: Note[];
  student?: Student;
}

export interface BulletinSummary {
  id: string;
  studentId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber?: string;
  };
  class: { id: string; name: string };
  period: { id: string; name: string };
  totalScore: number;
  averageScore: number;
  rank?: number;
  isPromoted?: boolean;
  comments?: string;
  generatedAt: string;
}

export interface DetailedBulletinSubject {
  id: string;
  name: string;
  code?: string;
  coefficient: number;
  average: number;
  totalPoints: number;
  appreciation: string;
  notes: { id: string; value: number; maxValue: number; coefficient: number; examTitle?: string }[];
}

export interface DetailedBulletinData {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber?: string;
    dateOfBirth?: string;
    photo?: string;
  };
  class: {
    id: string;
    name: string;
    code?: string;
    classLevel?: { name: string };
    academicYear?: { name: string };
  };
  period: { id: string; name: string; type?: string };
  totalScore: number;
  averageScore: number;
  rank?: number;
  isPromoted?: boolean;
  comments?: string;
  subjects: DetailedBulletinSubject[];
  classStatistics: {
    totalStudents: number;
    classAverage: number;
    maxAverage: number;
    minAverage: number;
  };
}
