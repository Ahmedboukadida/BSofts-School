// Deprecated: locale is now managed via localStorage in i18n-provider.tsx
export const locales = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';
