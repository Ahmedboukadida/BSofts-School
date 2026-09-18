import { create } from 'zustand';

export interface EstablishmentOption {
  id: string;
  name: string;
  slug: string;
  category: string;
  tenantId: string;
  code?: string;
  city?: string;
}

export interface TenantOption {
  id: string;
  name: string;
}

export interface AcademicYearOption {
  id: string;
  name: string;
  isCurrent: boolean;
  establishmentId: string;
}

interface EstablishmentState {
  currentEstablishmentId: string | null;
  currentTenantId: string | null;
  currentAcademicYearId: string | null;
  establishments: EstablishmentOption[];
  tenants: TenantOption[];
  academicYears: AcademicYearOption[];
  menuOrientation: 'vertical' | 'horizontal';
  setCurrentEstablishmentId: (id: string | null) => void;
  setCurrentTenantId: (id: string | null) => void;
  setCurrentAcademicYearId: (id: string | null) => void;
  setEstablishments: (establishments: EstablishmentOption[]) => void;
  setTenants: (tenants: TenantOption[]) => void;
  setAcademicYears: (years: AcademicYearOption[]) => void;
  setMenuOrientation: (orientation: 'vertical' | 'horizontal') => void;
  fetchEstablishments: () => Promise<void>;
  initializeFromUser: (user: {
    isRoot?: boolean;
    establishmentId?: string;
    userRoles?: { establishmentId?: string; role: { name: string } }[];
  }) => void;
}

export const useEstablishmentStore = create<EstablishmentState>((set) => ({
  currentEstablishmentId: typeof window !== 'undefined' ? localStorage.getItem('x-establishment-id') : null,
  currentTenantId: typeof window !== 'undefined' ? localStorage.getItem('x-tenant-id') : null,
  currentAcademicYearId: typeof window !== 'undefined' ? localStorage.getItem('x-academic-year-id') : null,
  establishments: [],
  tenants: [],
  academicYears: [],
  menuOrientation: (typeof window !== 'undefined' && (localStorage.getItem('menu-orientation') as 'vertical' | 'horizontal')) || 'vertical',

  setCurrentEstablishmentId: (id: string | null) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('x-establishment-id', id);
      } else {
        localStorage.removeItem('x-establishment-id');
      }
    }
    set({ currentEstablishmentId: id });
  },

  setCurrentTenantId: (id: string | null) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('x-tenant-id', id);
      } else {
        localStorage.removeItem('x-tenant-id');
      }
    }
    set({ currentTenantId: id });
  },

  setCurrentAcademicYearId: (id: string | null) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('x-academic-year-id', id);
      } else {
        localStorage.removeItem('x-academic-year-id');
      }
    }
    set({ currentAcademicYearId: id });
  },

  setEstablishments: (establishments: EstablishmentOption[]) => {
    set({ establishments });
  },

  setTenants: (tenants: TenantOption[]) => {
    set({ tenants });
  },

  setAcademicYears: (academicYears: AcademicYearOption[]) => {
    set({ academicYears });
  },

  setMenuOrientation: (orientation: 'vertical' | 'horizontal') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('menu-orientation', orientation);
    }
    set({ menuOrientation: orientation });
  },

  fetchEstablishments: async () => {
    try {
      const apiModule = await import('@/lib/api');
      const api = apiModule.default;
      const res = await api.get('/establishments?limit=100').catch(() => ({ data: { data: [] } }));
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        set({
          establishments: list.map((e: any) => ({
            id: e.id,
            name: e.name,
            slug: e.slug || '',
            category: e.category || 'PRIMARY',
            tenantId: e.tenantId || '',
            code: e.code || '',
            city: e.city || '',
          })),
        });
      }
    } catch {
      // Handled
    }
  },

  initializeFromUser: (user) => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('x-establishment-id');
    if (stored) {
      set({ currentEstablishmentId: stored });
      return;
    }
    const defaultEstId = user.establishmentId || user.userRoles?.[0]?.establishmentId || null;
    if (defaultEstId) {
      localStorage.setItem('x-establishment-id', defaultEstId);
      set({ currentEstablishmentId: defaultEstId });
    }
  },
}));
