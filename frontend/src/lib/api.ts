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
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'x-xsrf-token',
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

    // Attach CSRF double-submit token if cookie exists
    const xsrfCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
    if (xsrfCookie && !config.headers['x-xsrf-token']) {
      config.headers['x-xsrf-token'] = decodeURIComponent(xsrfCookie);
    }

    const { user } = useAuthStore.getState();
    const isValidId = (val: string | null | undefined) =>
      Boolean(val && val !== 'ALL' && val !== 'all' && val !== 'null' && val !== 'undefined' && !val.startsWith('year-'));

    const storedEstId = localStorage.getItem('x-establishment-id');
    const storedTenantId = localStorage.getItem('x-tenant-id');
    const storedYearId = localStorage.getItem('x-academic-year-id');
    const establishmentId = storedEstId || user?.establishmentId || user?.userRoles?.[0]?.establishmentId;

    if (isValidId(establishmentId)) {
      config.headers['x-establishment-id'] = establishmentId;
    }
    if (isValidId(storedTenantId)) {
      config.headers['x-tenant-id'] = storedTenantId;
    }
    if (isValidId(storedYearId)) {
      config.headers['x-academic-year-id'] = storedYearId;
    }
  }
  return config;
});

// LRU Query Cache with TTL and Mutating Invalidation
interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
}

class LruQueryCache {
  private readonly maxCapacity: number;
  private readonly defaultTtlMs: number;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(maxCapacity = 100, defaultTtlMs = 60000) {
    this.maxCapacity = maxCapacity;
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    // Re-insert to refresh recency
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = this.defaultTtlMs): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxCapacity) {
      // Evict oldest (least recently used)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidateMatching(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const lruQueryCache = new LruQueryCache(150, 45000); // 150 entries, 45s TTL

// In-flight GET deduplication map
const inFlightGetRequests = new Map<string, Promise<any>>();
const originalGet = api.get.bind(api);

export function clearApiCache(): void {
  inFlightGetRequests.clear();
  lruQueryCache.clear();
}

(api as any).clearCache = clearApiCache;
(api as any).lruCache = lruQueryCache;

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

  // Check LRU cache first (if not explicitly bypassing cache)
  const bypassCache = Boolean(config?.headers?.['x-skip-cache'] || config?.skipCache);
  if (!bypassCache) {
    const cachedData = lruQueryCache.get<R>(key);
    if (cachedData !== undefined) {
      return Promise.resolve(cachedData);
    }
  }

  // Deduplicate concurrent in-flight requests
  if (inFlightGetRequests.has(key)) {
    return inFlightGetRequests.get(key) as Promise<R>;
  }

  const timeoutId = setTimeout(() => {
    inFlightGetRequests.delete(key);
  }, 15000);

  const promise = originalGet<T, R, D>(url, config)
    .then((response: any) => {
      if (!bypassCache && response && response.status >= 200 && response.status < 300) {
        lruQueryCache.set(key, response);
      }
      return response;
    })
    .finally(() => {
      clearTimeout(timeoutId);
      inFlightGetRequests.delete(key);
    });

  inFlightGetRequests.set(key, promise);
  return promise as Promise<any>;
};

api.interceptors.response.use(
  (response) => {
    // Automatically invalidate cached queries when modifying data
    const method = response.config?.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      lruQueryCache.clear();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${getBaseUrl()}/auth/refresh`, { refreshToken });
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
