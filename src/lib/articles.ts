import { articlesMetadata } from './generated/metadata';

export type ArticleMetadata = {
  title: string;
  description: string;
  date: string;
  slug: string;
};

// Get articles for a specific locale with fallback to English
export function getArticles(locale: string = 'en'): ArticleMetadata[] {
  return articlesMetadata[locale] || articlesMetadata['en'] || [];
}

// Get all articles (backward compatibility)
export const articles: ArticleMetadata[] = getArticles('en');

// Get a specific article by slug for a given locale
export function getArticleBySlug(slug: string, locale: string = 'en'): ArticleMetadata | undefined {
  const localeArticles = getArticles(locale);
  return localeArticles.find((article) => article.slug === slug);
}

// MDX components mapping for all locales (webpack will handle this at build time)
const articleComponents: Record<string, Record<string, React.ComponentType>> = {
  'en': {
    'getting-started-with-ai-coding': require('@content/articles/en/getting-started-with-ai-coding.mdx').default,
  },
  'zh-Hans': {
    'getting-started-with-ai-coding': require('@content/articles/zh-Hans/getting-started-with-ai-coding.mdx').default,
  },
};

// Get components for a specific locale with fallback to English
export function getArticleComponents(locale: string = 'en'): Record<string, React.ComponentType> {
  return articleComponents[locale] || articleComponents['en'] || {};
}
