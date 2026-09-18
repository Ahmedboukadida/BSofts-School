import type React from 'react';

export interface BaseAuditItem {
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByName?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
  deletedByName?: string;
}

export interface WizardStep {
  number: number;
  label: string;
  desc?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface AuditLog {
  id: string;
  actorSnapshot?: string;
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  status?: 'SUCCESS' | 'FAILURE' | string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PERMANENT_DELETE' | 'LOGIN' | 'LOGOUT' | 'RESTORE';
  entity: string;
  entityId?: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  createdAt: string;
  createdBy?: string;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  stack?: string;
  context?: string;
  userId?: string;
  createdAt: string;
}

export interface SystemLogItem {
  id: string;
  level: 'FATAL' | 'ERROR' | 'WARN' | 'INFO';
  service: string;
  message: string;
  statusCode?: number;
  endpoint?: string;
  stackTrace?: string;
  tenantName?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  status: 'SUCCESS' | 'FAILED';
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  createdAt: string;
}

export interface DashboardStats {
  students: number;
  teachers: number;
  classes: number;
  revenueTND: number;
  pendingTND: number;
  attendanceRate: number;
}
