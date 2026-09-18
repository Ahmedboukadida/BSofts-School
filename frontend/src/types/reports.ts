export interface AttendanceStat {
  name: string;
  present: number;
  absent: number;
  late: number;
}

export interface PaymentStat {
  name: string;
  value: number;
}

export interface EnrollmentStat {
  month: string;
  students: number;
  teachers: number;
}

export interface PaymentReportItem {
  status: string;
  amount: number;
}

export interface AttendanceReportItem {
  status: string;
}

export interface ReportFilter {
  reportType: string;
  dateRange: string;
  establishmentId?: string;
}
