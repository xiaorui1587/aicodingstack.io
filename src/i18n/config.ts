export const locales = ['en', 'zh-Hans'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  'zh-Hans': '简体中文',
};

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  'zh-Hans': '中文',
};
