import { usePermissionsStore } from '@/store/permissions-store';

export function useCan(permission: string): boolean {
  const { hasPermission } = usePermissionsStore();
  return hasPermission(permission);
}
