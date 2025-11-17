export const locales = ['en', 'zh-Hans', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  'zh-Hans': '简体中文',
};

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  de: 'DE',
  'zh-Hans': '中文',
};

/**
 * Map locale codes to OpenGraph locale format
 * Used for og:locale meta tags
 */
export const localeToOgLocale: Record<Locale, string> = {
  en: 'en_US',
  de: 'de_DE',
  'zh-Hans': 'zh_CN',
};
