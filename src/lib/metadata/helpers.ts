/**
 * Metadata Helper Functions
 * Reusable utilities for building consistent metadata across all pages
 */

import type { Metadata } from 'next'
import { type Locale, locales, localeToOgLocale } from '@/i18n/config'
import { type Category, METADATA_DEFAULTS, OG_IMAGE_CONFIG, SITE_CONFIG } from './config'

/**
 * Maps internal locale format to OpenGraph locale format
 * @example 'zh-Hans' → 'zh_CN', 'en' → 'en_US'
 */
export function mapLocaleToOG(locale: string): string {
  return localeToOgLocale[locale as Locale] || localeToOgLocale[SITE_CONFIG.defaultLocale as Locale]
}

/**
 * Gets alternate locale for OpenGraph
 * Returns all other locales in OpenGraph format
 */
export function getAlternateOGLocale(locale: string): string[] {
  return locales.filter(l => l !== locale).map(l => localeToOgLocale[l])
}

/**
 * Builds a consistent page title with optional suffix
 */
export function buildTitle(options: {
  title: string
  suffix?: string
  includeSiteName?: boolean
  separator?: string
}): string {
  const {
    title,
    suffix,
    includeSiteName = true,
    separator = METADATA_DEFAULTS.titleSeparator,
  } = options

  const parts = [title]
  if (suffix) {
    parts.push(suffix)
  }
  if (includeSiteName) {
    parts.push(METADATA_DEFAULTS.siteName)
  }

  return parts.join(separator)
}

/**
 * Builds SEO-optimized list page title
 */
export function buildListPageTitle(options: {
  translatedTitle: string
  categoryName: string
  examples?: string[]
  year?: number
}): string {
  const {
    translatedTitle,
    categoryName,
    examples = [],
    year = METADATA_DEFAULTS.currentYear,
  } = options

  const parts = [translatedTitle, `-`, `Best ${categoryName} ${year}`]

  if (examples.length > 0) {
    parts.push(METADATA_DEFAULTS.listSeparator)
    parts.push(examples.join(', '))
  }

  parts.push(METADATA_DEFAULTS.titleSeparator)
  parts.push(METADATA_DEFAULTS.siteName)

  return parts.join(' ').replace(/\s+/g, ' ') // Clean up multiple spaces
}

/**
 * Builds product detail page title
 */
export function buildDetailPageTitle(options: {
  productName: string
  typeDescription: string
  year?: number
}): string {
  const { productName, typeDescription, year = METADATA_DEFAULTS.currentYear } = options

  return `${productName} - ${typeDescription} | Features & Setup Guide ${year}`
}

/**
 * Builds keywords array from multiple sources
 */
export function buildKeywords(parts: Array<string | string[]>): string {
  const flatKeywords = parts.flat().filter(Boolean)
  const uniqueKeywords = [...new Set(flatKeywords)]
  return uniqueKeywords.join(', ')
}

/**
 * Builds locale-aware canonical URL
 */
export function buildCanonicalUrl(options: {
  path: string
  locale: string
  includeLocalePrefix?: boolean
}): string {
  const { path, locale, includeLocalePrefix = true } = options

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // For default locale, don't include locale prefix in canonical
  if (locale === SITE_CONFIG.defaultLocale && !includeLocalePrefix) {
    return `/${cleanPath}`
  }

  // For non-default locale or when explicitly requested
  if (locale !== SITE_CONFIG.defaultLocale) {
    return `/${locale}/${cleanPath}`
  }

  return `/${cleanPath}`
}

/**
 * Builds language alternates for i18n
 */
export function buildLanguageAlternates(basePath: string): Record<string, string> {
  const alternates: Record<string, string> = {}

  SITE_CONFIG.supportedLocales.forEach(locale => {
    if (locale === SITE_CONFIG.defaultLocale) {
      alternates[locale] = `/${basePath}`
    } else {
      alternates[locale] = `/${locale}/${basePath}`
    }
  })

  return alternates
}

/**
 * Builds full URL from path
 */
export function buildFullUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_CONFIG.url}${cleanPath}`
}

/**
 * Builds OpenGraph image object
 */
export function buildOGImage(options: { imagePath: string; alt: string }): {
  url: string
  width: number
  height: number
  alt: string
} {
  return {
    url: options.imagePath,
    width: OG_IMAGE_CONFIG.width,
    height: OG_IMAGE_CONFIG.height,
    alt: options.alt,
  }
}

/**
 * Gets OG image path for a category item
 */
export function getOGImagePath(category: Category, slug: string): string {
  const categoryPath = OG_IMAGE_CONFIG.paths[category as keyof typeof OG_IMAGE_CONFIG.paths]
  return `${categoryPath}/${slug}.png`
}

/**
 * Builds complete OpenGraph metadata
 */
export function buildOpenGraph(options: {
  title: string
  description: string
  url: string
  locale: string
  type?: 'website' | 'article'
  images?: Array<{ url: string; alt: string }>
  siteName?: string
  publishedTime?: string
  modifiedTime?: string
}): Metadata['openGraph'] {
  const {
    title,
    description,
    url,
    locale,
    type = 'website',
    images = [],
    siteName = METADATA_DEFAULTS.siteName,
    publishedTime,
    modifiedTime,
  } = options

  const ogLocale = mapLocaleToOG(locale)
  const alternateLocale = getAlternateOGLocale(locale)

  const imageObjects =
    images.length > 0
      ? images.map(img => buildOGImage({ imagePath: img.url, alt: img.alt || siteName }))
      : [buildOGImage({ imagePath: OG_IMAGE_CONFIG.defaultImage, alt: siteName })]

  const baseOG = {
    title,
    description,
    url: buildFullUrl(url),
    siteName,
    locale: ogLocale,
    alternateLocale,
    type,
    images: imageObjects,
  }

  // Add article-specific fields
  if (type === 'article' && (publishedTime || modifiedTime)) {
    return {
      ...baseOG,
      type: 'article',
      publishedTime,
      modifiedTime,
    }
  }

  return baseOG
}

/**
 * Builds Twitter Card metadata
 */
export function buildTwitterCard(options: {
  title: string
  description: string
  images?: string[]
  cardType?: 'summary' | 'summary_large_image'
  includeCreator?: boolean
}): Metadata['twitter'] {
  const {
    title,
    description,
    images = [],
    cardType = 'summary_large_image',
    includeCreator = false,
  } = options

  const twitter: Metadata['twitter'] = {
    card: cardType,
    site: SITE_CONFIG.twitter.site,
    title,
    description,
  }

  if (images.length > 0 && twitter) {
    twitter.images = images
  }

  if (includeCreator && twitter) {
    twitter.creator = SITE_CONFIG.twitter.creator
  }

  return twitter
}

/**
 * Builds complete alternates object with canonical and languages
 */
export function buildAlternates(options: {
  canonicalPath: string
  locale: string
  languageBasePath?: string
}): Metadata['alternates'] {
  const { canonicalPath, locale, languageBasePath } = options

  const canonical = buildCanonicalUrl({
    path: canonicalPath,
    locale,
    includeLocalePrefix: false,
  })

  const alternates: Metadata['alternates'] = {
    canonical,
  }

  // Add language alternates if base path provided
  if (languageBasePath) {
    alternates.languages = buildLanguageAlternates(languageBasePath)
  }

  return alternates
}

/**
 * Format price for display in descriptions
 */
export function formatPriceForDescription(
  pricing: Array<{ value: number | null; currency: string | null; per: string | null }> | undefined
): string | null {
  if (!pricing || pricing.length === 0) return null

  const firstTier = pricing[0]
  if (!firstTier) return null
  if (firstTier.value === null || firstTier.value === 0) {
    return 'Free'
  }

  const price = firstTier.currency
    ? `${firstTier.currency} ${firstTier.value}`
    : `${firstTier.value}`
  const period = firstTier.per ? `/${firstTier.per}` : ''
  return `Starting from ${price}${period}`
}

/**
 * Format platforms for display
 */
export function formatPlatforms(platforms: Array<{ os: string }> | string[] | undefined): string {
  if (!platforms || platforms.length === 0) return 'Multiple Platforms'

  // Handle both object array and string array formats
  const platformNames = platforms.map(p => (typeof p === 'string' ? p : p.os))

  return platformNames.join(', ')
}

/**
 * Build product description with specs
 */
export function buildProductDescription(options: {
  baseDescription: string
  productName: string
  platforms?: string
  pricing?: string
  license?: string
}): string {
  const { baseDescription, productName, platforms, pricing, license } = options

  const parts = [baseDescription]

  if (platforms) {
    parts.push(`Download ${productName} for ${platforms}.`)
  }

  if (pricing) {
    parts.push(pricing)
  }

  if (license) {
    parts.push(`${license} license.`)
  }

  return parts.filter(Boolean).join(' ')
}
