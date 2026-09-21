import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

    // When running in a production browser (Vercel, custom domain), never fall back to localhost
    if (!isLocal) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
      }
      return 'https://bsofts-school.onrender.com/api';
    }
  }

  return envUrl || 'http://localhost:3025/api';
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const { user } = useAuthStore.getState();
    const storedEstId = localStorage.getItem('x-establishment-id');
    const storedTenantId = localStorage.getItem('x-tenant-id');
    const storedYearId = localStorage.getItem('x-academic-year-id');
    const establishmentId = storedEstId || user?.establishmentId || user?.userRoles?.[0]?.establishmentId;
    if (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all') {
      config.headers['x-establishment-id'] = establishmentId;
    }
    if (storedTenantId && storedTenantId !== 'ALL' && storedTenantId !== 'all') {
      config.headers['x-tenant-id'] = storedTenantId;
    }
    if (storedYearId && storedYearId !== 'ALL' && storedYearId !== 'all') {
      config.headers['x-academic-year-id'] = storedYearId;
    }
  }
  return config;
});

// Deduplicate concurrent in-flight GET requests
const inFlightGetRequests = new Map<string, Promise<any>>();
const originalGet = api.get.bind(api);

(api as any).get = function <T = any, R = any, D = any>(
  url: string,
  config?: any
): Promise<any> {
  if (typeof window === 'undefined') {
    return originalGet(url, config);
  }

  const token = localStorage.getItem('accessToken') || '';
  const estId = localStorage.getItem('x-establishment-id') || '';
  const tenantId = localStorage.getItem('x-tenant-id') || '';
  const paramsKey = config?.params ? JSON.stringify(config.params) : '';
  const key = `${url}::${paramsKey}::${token}::${estId}::${tenantId}`;

  if (inFlightGetRequests.has(key)) {
    return inFlightGetRequests.get(key) as Promise<R>;
  }

  const promise = originalGet<T, R, D>(url, config).finally(() => {
    inFlightGetRequests.delete(key);
  });

  inFlightGetRequests.set(key, promise);
  return promise as Promise<any>;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        // refresh failed
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
