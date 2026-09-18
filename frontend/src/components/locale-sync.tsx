'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/components/providers/i18n-provider';

export function LocaleSync() {
  const { locale } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}
