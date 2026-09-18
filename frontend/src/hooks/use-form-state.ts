import { useState, useCallback } from 'react';

interface UseFormStateOptions<T> {
  defaultValues: T;
}

export function useFormState<T extends Record<string, unknown>>({ defaultValues }: UseFormStateOptions<T>) {
  const [formData, setFormData] = useState<T>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(defaultValues);
    setError('');
    setIsLoading(false);
  }, [defaultValues]);

  return { formData, setFormData, setField, resetForm, isLoading, setIsLoading, error, setError };
}
