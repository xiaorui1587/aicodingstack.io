/**
 * SEO Helper Functions
 * Utilities for generating SEO-friendly URLs and metadata
 */

import { defaultLocale, type Locale, locales, localeToOgLocale } from '@/i18n/config'

/**
 * Generate canonical path with locale support
 * Default locale (en) doesn't get a prefix, other locales do
 */
export function getCanonicalPath(basePath: string, locale: string): string {
  return locale === defaultLocale ? basePath : `/${locale}${basePath}`
}

/**
 * Generate full URL with locale support
 */
export function getFullUrl(basePath: string, locale: string): string {
  const canonicalPath = getCanonicalPath(basePath, locale)
  return `https://aicodingstack.io${canonicalPath}`
}

/**
 * Generate language alternates for a given base path
 * Dynamically builds alternates from configured locales
 */
export function getLanguageAlternates(basePath: string): Record<string, string> {
  const alternates: Record<string, string> = {}

  locales.forEach(locale => {
    if (locale === defaultLocale) {
      alternates[locale] = basePath
    } else {
      alternates[locale] = `/${locale}${basePath}`
    }
  })

  return alternates
}

/**
 * Get OpenGraph locale string
 * Maps locale code to OpenGraph format (e.g., 'en' -> 'en_US')
 */
export function getOgLocale(locale: string): string {
  return localeToOgLocale[locale as Locale] || localeToOgLocale[defaultLocale]
}

/**
 * Get OpenGraph alternate locales
 * Returns all other locales in OpenGraph format
 */
export function getOgAlternateLocales(locale: string): string[] {
  return locales.filter(l => l !== locale).map(l => localeToOgLocale[l])
}

/**
 * Generate complete metadata alternates object
 */
export function getMetadataAlternates(basePath: string, locale: string) {
  return {
    canonical: getCanonicalPath(basePath, locale),
    languages: getLanguageAlternates(basePath),
  }
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
  }
}
