/**
 * Authentication & Security Types
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';
  status?: string;
  phone?: string;
  establishmentId?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  action: string;
  resource: string;
  description?: string;
}

