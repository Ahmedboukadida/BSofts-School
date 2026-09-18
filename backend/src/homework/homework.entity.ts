export class HomeworkEntity {
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
  establishmentId?: string;
  classId?: string;
  matiereId?: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByName?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;

  constructor(partial: Partial<HomeworkEntity>) {
    Object.assign(this, partial);
    this.submissionsCount = this.submissionsCount ?? 0;
    this.totalStudents = this.totalStudents ?? 30;
    this.status = this.status ?? 'OPEN';
    this.isDeleted = this.isDeleted ?? false;
  }
}
