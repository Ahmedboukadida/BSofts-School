'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface DynamicOption {
  code: string;
  label: string;
  color?: string;
}

export function useDynamicEnums(category: string, fallbackOptions: DynamicOption[] = []) {
  const [options, setOptions] = useState<DynamicOption[]>(fallbackOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api
      .get(`/dynamic-enums/category/${category}`)
      .then((res) => {
        if (!isMounted) return;
        const raw = res.data?.data || res.data;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: DynamicOption[] = raw.map((item: any) => ({
            code: item.code,
            label: item.labelFr || item.label || item.labelEn || item.code,
            color: item.color,
          }));
          setOptions(mapped);
        } else {
          setOptions(fallbackOptions);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        // Non-blocking fallback to provided defaults
        setError(err.message || 'Failed to load dynamic enums');
        setOptions(fallbackOptions);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [category]);

  return { options, isLoading, error };
}
