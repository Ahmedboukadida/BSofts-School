'use client';
import { usePermissionsStore } from '@/store/permissions-store';

interface CanProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = usePermissionsStore();
  if (!hasPermission(permission)) return <>{fallback}</>;
  return <>{children}</>;
}
