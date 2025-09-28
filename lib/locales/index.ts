import mnTranslations from './mn.json';
import enTranslations from './en.json';

export type Locale = 'mn' | 'en';

export const locales: Locale[] = ['mn', 'en'];

export const defaultLocale: Locale = 'mn';

export const translations = {
  mn: mnTranslations,
  en: enTranslations,
} as const;

export type TranslationKeys = typeof mnTranslations;

// Helper function to get nested translation
export function getNestedTranslation(
  obj: Record<string, unknown>,
  path: string
): string {
  return path.split('.').reduce((current: unknown, key: string) => {
    return (current as Record<string, unknown>)?.[key] || path;
  }, obj) as string;
}

// Translation function
export function t(key: string, locale: Locale = defaultLocale): string {
  const translation = getNestedTranslation(translations[locale], key);
  return translation || key;
}
