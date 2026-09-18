import { Student } from './student';
import { Parent } from './parent';

export interface PaymentPlan {
  id: string;
  name: string;
  totalAmount: number;
  installmentsCount: number;
  establishmentId: string;
  isActive: boolean;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  method: 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  paidAt?: string;
  dueDate?: string;
  reference?: string;
  checkNumber?: string;
  notes?: string;
  parentId?: string;
  planId?: string;
  student?: Student;
  parent?: Parent;
}

export interface StudentPaymentItem {
  id: string;
  amount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt?: string;
  method?: string;
  student?: { id: string; firstName: string; lastName: string; registrationNumber: string };
  plan?: { id: string; name: string };
  notes?: string;
}

export interface CaisseItem {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
  _count?: { transactions: number };
}

export interface TransactionItem {
  id: string;
  caisseId: string;
  caisse?: { id: string; name: string };
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'REFUND' | 'PENALTY';
  amount: number;
  balance: number;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface TeacherPaymentItem {
  id: string;
  teacherId: string;
  teacher?: { id: string; firstName: string; lastName: string };
  contract?: { id: string; contractType: string; salary: number };
  period: string;
  amount: number;
  hoursWorked?: number;
  calculatedAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paidAt?: string;
  notes?: string;
}

export interface TeacherPayment {
  id: string;
  teacherId: string;
  month: number;
  year: number;
  baseSalary: number;
  hoursWorked?: number;
  hourlyRate?: number;
  bonus?: number;
  deductions?: number;
  netAmount: number;
  status: 'PAID' | 'PENDING';
  paidAt?: string;
}

export interface PaymentFormData {
  studentId: string;
  parentId: string;
  amount: number | string;
  method: 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentDate: string;
  dueDate: string;
  reference: string;
  checkNumber: string;
  notes: string;
  planId: string;
}
