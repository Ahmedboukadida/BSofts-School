import { BaseAuditItem } from './system';
import { User } from './auth';

export interface SaaSPlan {
  id: string;
  name: string;
  code: string;
  description?: string;
  price?: number;
  currency?: string;
  interval?: 'MONTHLY' | 'YEARLY';
  priceMonthly?: number;
  priceYearly?: number;
  maxStudents?: number;
  maxTeachers?: number;
  maxEstablishments?: number;
  features?: string[];
  isActive: boolean;
}

export interface SaaSModule {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'CANCELLED' | 'TRIALING' | 'TRIAL';
  startDate: string;
  endDate?: string;
  tenant?: Tenant;
  plan?: SaaSPlan;
}

export type Subscription = TenantSubscription;

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  subdomain?: string;
  contactEmail?: string;
  contactPhone?: string;
  domain?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  isActive?: boolean;
  planId?: string;
  plan?: SaaSPlan;
  createdAt?: string;
  user?: User;
}

export interface Establishment {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
}

export interface TenantItem extends BaseAuditItem {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  ownerName: string;
  ownerEmail: string;
  establishmentsCount: number;
  activePlanName: string;
  activePlanPrice: number;
  currency: 'TND';
  isActive: boolean;
}

export interface SubscriptionItem extends BaseAuditItem {
  id: string;
  subscriptionNumber: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  price: number;
  currency: 'TND';
  status: 'REQUESTED' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  daysRemaining: number;
  autoRenew: boolean;
  contactPerson?: string;
  contactEmail?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface PlanItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: 'TND';
  interval: 'MONTHLY' | 'YEARLY';
  maxStudents: number;
  maxTeachers: number;
  maxStorageGb: number;
  activeSubscribers: number;
  features: { code: string; name: string; included: boolean }[];
  isPopular?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ModuleItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  category: 'CORE' | 'ACADEMIC' | 'FINANCE' | 'COMMUNITY' | 'INTELLIGENCE';
  description: string;
  functionsCount: number;
  functionsList: string[];
  plans: string[];
  isCore: boolean;
  isActive: boolean;
}

export interface FunctionItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  moduleId: string;
  moduleName: string;
  description: string;
  permissions: { id: string; code: string; name: string }[];
  rolesCount?: number;
  isActive: boolean;
}

export interface RoleItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  usersCount: number;
  permissionsCount: number;
  permissionsList: string[];
  isActive: boolean;
}

export interface PermissionItem extends BaseAuditItem {
  id: string;
  code: string;
  name: string;
  module: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'ADMIN';
  description?: string;
  roles: string[];
  isActive: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
}

export interface EstablishmentItem extends BaseAuditItem {
  id: string;
  name: string;
  code: string;
  category: 'DAYCARE' | 'PRIMARY' | 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'UNIVERSITY';
  address?: string;
  phone?: string;
  email?: string;
  directorName?: string;
  capacity?: number;
  studentsCount?: number;
  teachersCount?: number;
  roomsCount?: number;
  isActive: boolean;
  tenantId: string;
  tenantName?: string;
}
