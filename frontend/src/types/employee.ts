import { BaseAuditItem } from './system';

export interface EmployeeContract {
  id?: string;
  type: 'CDI' | 'CDD' | 'STAGE' | 'AUTRE';
  salary?: number;
  startDate?: string;
  endDate?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  contractType?: string;
  salary?: number;
  hireDate?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  establishmentId?: string;
  contracts?: EmployeeContract[];
}

export interface EmployeeItem extends BaseAuditItem {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  contractType: 'CDI' | 'CDD' | 'STAGE' | 'VACATAIRE';
  salaryTnd?: number;
  email: string;
  phone: string;
  hireDate: string;
  isActive: boolean;
  establishmentName?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  contractType: string;
  salary: number;
  hireDate: string;
}
