/**
 * SEO Helper Functions
 * Utilities for generating SEO-friendly URLs and metadata
 */

/**
 * Generate canonical path with locale support
 */
export function getCanonicalPath(basePath: string, locale: string): string {
  return locale === 'en' ? basePath : `/${locale}/${basePath}`;
}

/**
 * Generate full URL with locale support
 */
export function getFullUrl(basePath: string, locale: string): string {
  const canonicalPath = getCanonicalPath(basePath, locale);
  return `https://aicodingstack.io${canonicalPath}`;
}

/**
 * Generate language alternates for a given base path
 */
export function getLanguageAlternates(basePath: string): Record<string, string> {
  return {
    'en': basePath,
    'zh-Hans': `/zh-Hans${basePath}`,
  };
}

/**
 * Get OpenGraph locale string
 */
export function getOgLocale(locale: string): string {
  return locale === 'zh-Hans' ? 'zh_CN' : 'en_US';
}

/**
 * Get OpenGraph alternate locales
 */
export function getOgAlternateLocales(locale: string): string[] {
  return locale === 'en' ? ['zh_CN'] : ['en_US'];
}

/**
 * Generate complete metadata alternates object
 */
export function getMetadataAlternates(basePath: string, locale: string) {
  return {
    canonical: getCanonicalPath(basePath, locale),
    languages: getLanguageAlternates(basePath),
  };
}

/**
 * Generate OpenGraph metadata with locale support
 */
export function getOpenGraphMetadata(
  title: string,
  description: string,
  basePath: string,
  locale: string,
  imagePath?: string
) {
  return {
    title,
    description,
    url: getFullUrl(basePath, locale),
    locale: getOgLocale(locale),
    alternateLocale: getOgAlternateLocales(locale),
    ...(imagePath && {
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    }),
    type: 'article' as const,
  };
}
