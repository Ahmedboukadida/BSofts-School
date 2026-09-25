'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import ar from '../../../messages/ar.json';

export type Locale = 'en' | 'fr' | 'ar';

type MessageNode = string | number | boolean | null | undefined | MessageNode[] | { [key: string]: MessageNode };

const messages: Record<Locale, Record<string, MessageNode>> = { en, fr, ar };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale = 'fr',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale | null;
      if (saved && messages[saved] && saved !== locale) {
        setLocaleState(saved);
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = saved;
        document.cookie = `locale=${saved};path=/;max-age=31536000;SameSite=Lax`;
        document.body.style.fontFamily = saved === 'ar' ? "'Cairo', 'Tajawal', sans-serif" : "'Satoshi', sans-serif";
      } else {
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
        document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
        document.body.style.fontFamily = locale === 'ar' ? "'Cairo', 'Tajawal', sans-serif" : "'Satoshi', sans-serif";
      }
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.cookie = `locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLocale;
      document.body.style.fontFamily = newLocale === 'ar' ? "'Cairo', 'Tajawal', sans-serif" : "'Satoshi', sans-serif";
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');

    // 1. Try active locale
    let value: unknown = messages[locale];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    // 2. Fallback to French if missing
    if (typeof value !== 'string' && locale !== 'fr') {
      let fallbackVal: unknown = messages['fr'];
      for (const k of keys) {
        if (fallbackVal && typeof fallbackVal === 'object') {
          fallbackVal = (fallbackVal as Record<string, unknown>)[k];
        } else {
          fallbackVal = undefined;
          break;
        }
      }
      if (typeof fallbackVal === 'string') {
        value = fallbackVal;
      }
    }

    // 3. Fallback to English if still missing
    if (typeof value !== 'string' && locale !== 'en') {
      let fallbackVal: unknown = messages['en'];
      for (const k of keys) {
        if (fallbackVal && typeof fallbackVal === 'object') {
          fallbackVal = (fallbackVal as Record<string, unknown>)[k];
        } else {
          fallbackVal = undefined;
          break;
        }
      }
      if (typeof fallbackVal === 'string') {
        value = fallbackVal;
      }
    }

    if (typeof value !== 'string') return key;

    if (params) {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val)),
        value,
      );
    }
    return value;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}
