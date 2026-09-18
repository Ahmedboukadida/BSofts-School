'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

interface UseApiOptions {
  immediate?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: () => Promise<void>;
}

export function useApi<T>(url: string, options: UseApiOptions = {}): UseApiResult<T> {
  const { immediate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, isLoading, error, execute };
}

export function useMutation<TData, TVariables>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post'
) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables?: TVariables): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        switch (method) {
          case 'post':
            response = await api.post(url, variables);
            break;
          case 'put':
            response = await api.put(url, variables);
            break;
          case 'patch':
            response = await api.patch(url, variables);
            break;
          case 'delete':
            response = await api.delete(url);
            break;
        }
        setData(response?.data);
        return response?.data || null;
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj.response?.data?.message || 'An error occurred');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url, method]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, mutate, reset };
}
