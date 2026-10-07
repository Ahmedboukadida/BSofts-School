export * from './api';
export * from './auth';
export * from './student';
export * from './teacher';
export * from './class';
export * from './parent';
export * from './employee';
export * from './academic';
export * from './exam';
export * from './caisse';
export * from './payment';
export * from './room';
export * from './holiday';
export * from './attendance';
export * from './saas';
export * from './community';
export * from './system';
export * from './upload';
export * from './mail';
export * from './reports';

export interface BulletinItem {
  id: string;
  studentId: string;
  classId: string;
  periodId: string;
  totalScore: number;
  averageScore: number;
  rank?: number;
  isPromoted?: boolean;
  comments?: string;
  generatedAt: string;
  generatedBy?: string;
  student?: { id: string; firstName: string; lastName: string };
  class?: { id: string; name: string };
  period?: { id: string; name: string };
}

export interface DetailedBulletin extends BulletinItem {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber?: string;
    dateOfBirth?: string;
    photo?: string;
    user?: { email: string };
  };
  class: {
    id: string;
    name: string;
    code?: string;
    classLevel?: { name: string };
    academicYear?: { name: string };
  };
  period: { id: string; name: string; type?: string };
  subjects: {
    id: string;
    name: string;
    code?: string;
    coefficient: number;
    average: number;
    totalPoints: number;
    appreciation: string;
    notes: { id: string; value: number; maxValue: number; coefficient: number; examTitle?: string }[];
  }[];
  classStatistics: {
    totalStudents: number;
    classAverage: number;
    maxAverage: number;
    minAverage: number;
  };
}
