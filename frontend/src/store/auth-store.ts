import { create } from 'zustand';
import api from '@/lib/api';
import { usePermissionsStore } from '@/store/permissions-store';

interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isRoot: boolean;
  tenantId?: string;
  establishmentId?: string;
  userRoles?: { establishmentId?: string; role: { name: string; code?: string } }[];
  student?: { id: string; establishmentId: string; registrationNumber: string } | null;
  parent?: { id: string; establishmentId: string } | null;
  teacher?: { id: string; establishmentId: string } | null;
  employee?: { id: string; establishmentId: string } | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  planId?: string;
}

let inFlightLoadUser: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { identifier: email, password });
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
    usePermissionsStore.getState().fetchPermissions(user);
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
    usePermissionsStore.getState().fetchPermissions(user);
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    if (inFlightLoadUser) return inFlightLoadUser;

    inFlightLoadUser = (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isLoading: false });
          return;
        }
        const response = await api.get('/auth/profile');
        const userData = response.data;
        const establishmentId = userData.userRoles?.[0]?.establishmentId;
        set({ user: { ...userData, establishmentId }, isAuthenticated: true, isLoading: false });
        usePermissionsStore.getState().fetchPermissions(userData);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      } finally {
        inFlightLoadUser = null;
      }
    })();

    return inFlightLoadUser;
  },
}));
