'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface AiStatusResponse {
  isEnabled: boolean;
  provider: string;
  model: string;
}

// Global cache to avoid multi-component request waterfall
let cachedStatus: AiStatusResponse | null = null;
let lastFetchedTenantId: string | null = null;

export function useTenantAi() {
  const { user, isAuthenticated } = useAuthStore();
  const currentTenantId = user?.tenantId || (user?.isRoot ? 'ROOT' : null);

  const [hasAiFeature, setHasAiFeature] = useState<boolean>(() => {
    if (user?.isRoot) return true;
    if (cachedStatus && lastFetchedTenantId === currentTenantId) {
      return cachedStatus.isEnabled;
    }
    return false;
  });
  const [provider, setProvider] = useState<string>(cachedStatus?.provider || 'GEMINI');
  const [model, setModel] = useState<string>(cachedStatus?.model || 'gemini-2.5-flash');
  const [isLoading, setIsLoading] = useState<boolean>(!cachedStatus);

  const checkStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setHasAiFeature(false);
      setIsLoading(false);
      return;
    }

    if (user?.isRoot) {
      setHasAiFeature(true);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/ai/status');
      const data: AiStatusResponse = res.data;
      cachedStatus = data;
      lastFetchedTenantId = currentTenantId;

      setHasAiFeature(Boolean(data.isEnabled));
      setProvider(data.provider || 'GEMINI');
      setModel(data.model || 'gemini-2.5-flash');
    } catch {
      // If endpoint fails or 403, safely degrade to normal SaaS mode without AI
      setHasAiFeature(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.isRoot, currentTenantId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    hasAiFeature,
    provider,
    model,
    isLoading,
    refetch: checkStatus,
  };
}
