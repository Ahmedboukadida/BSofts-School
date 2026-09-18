import { BaseAuditItem } from './system';

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'NATIONAL' | 'SCHOOL' | 'RELIGIOUS';
  description?: string;
}

export interface HolidayItem extends BaseAuditItem {
  id: string;
  name: string;
  type: 'ACADEMIC_VACATION' | 'NATIONAL' | 'RELIGIOUS';
  startDate: string;
  endDate: string;
  durationDays: number;
  academicYear: string;
  isClosedForStudents: boolean;
  isClosedForStaff: boolean;
  description?: string;
}

export interface HolidayFormData {
  name: string;
  startDate: string;
  endDate: string;
  type: 'NATIONAL' | 'SCHOOL' | 'RELIGIOUS';
  description?: string;
}
