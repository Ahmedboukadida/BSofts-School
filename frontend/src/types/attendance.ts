import { Student } from './student';
import { Teacher } from './teacher';
import { Class } from './class';

export interface StudentAttendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  student?: Student;
  class?: Class;
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  teacher?: Teacher;
}

export interface AttendanceRecord {
  id: string;
  date?: string;
  targetId?: string;
  targetName?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber?: string;
  };
  session?: {
    id: string;
    date: string;
    topic?: string;
    class?: { id: string; name: string };
  };
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  reason?: string;
  createdAt?: string;
}
