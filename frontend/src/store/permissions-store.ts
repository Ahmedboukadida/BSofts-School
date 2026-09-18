import { create } from 'zustand';
import api from '@/lib/api';

interface PermissionsState {
  permissions: string[];
  isLoading: boolean;
  fetchPermissions: (providedUser?: any) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: [],
  isLoading: false,
  fetchPermissions: async (providedUser?: any) => {
    set({ isLoading: true });
    try {
      const user = providedUser || (await api.get('/auth/profile')).data;
      if (user?.isRoot) {
        set({ permissions: ['*'], isLoading: false });
        return;
      }
      const roles = user.userRoles || [];
      const permSet = new Set<string>();
      for (const ur of roles) {
        const roleRes = await api.get(`/role-permissions/role/${ur.roleId}`);
        const rolePerms = roleRes.data || [];
        for (const rp of rolePerms) {
          if (rp.permission) {
            permSet.add(`${rp.permission.moduleCode}:${rp.permission.action}`);
          }
        }
      }
      set({ permissions: Array.from(permSet), isLoading: false });
    } catch {
      set({ permissions: [], isLoading: false });
    }
  },
  hasPermission: (permission: string) => {
    const { permissions } = get();
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  },
  hasAnyPermission: (permissions: string[]) => {
    const { permissions: userPerms } = get();
    if (userPerms.includes('*')) return true;
    return permissions.some(p => userPerms.includes(p));
  },
}));
