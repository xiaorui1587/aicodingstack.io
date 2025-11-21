import { defaultLocale, type Locale } from '@/i18n/config'

/**
 * Interface for manifest items with i18n support
 */
export interface ManifestItemWithI18n {
  description?: string
  name?: string
  i18n?: {
    [locale: string]: {
      description?: string
      name?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

/**
 * Get localized field from a manifest item
 * @param item - The manifest item with potential i18n translations
 * @param field - The field name to translate (e.g., 'description', 'name')
 * @param locale - The target locale (e.g., 'en', 'zh-Hans')
 * @returns The localized value or the original value if translation not found
 */
export function getLocalizedField<T extends ManifestItemWithI18n>(
  item: T,
  field: keyof T,
  locale: Locale
): string {
  // If locale is default, return the original field
  if (locale === defaultLocale) {
    return item[field] as string
  }

  // Check if i18n translations exist for this locale
  const translation = item.i18n?.[locale]
  if (translation && field in translation && translation[field as string]) {
    return translation[field as string] as string
  }

  // Fallback to original field
  return item[field] as string
}

/**
 * Apply localization to a manifest item
 * @param item - The manifest item with potential i18n translations
 * @param locale - The target locale (e.g., 'en', 'zh-Hans')
 * @param fields - Array of field names to localize (default: ['description'])
 * @returns A new object with localized fields
 */
export function localizeManifestItem<T extends Record<string, unknown>>(
  item: T,
  locale: Locale,
  fields: (keyof T)[] = ['description' as keyof T]
): T {
  // If locale is default, return the original item
  if (locale === defaultLocale) {
    return item
  }

  // Create a new object with localized fields
  const localizedItem = { ...item }

  // Check if item has i18n translations
  const i18nData = item.i18n as Record<string, Record<string, string>> | undefined
  if (!i18nData || !i18nData[locale]) {
    return item
  }

  // Apply translations for requested fields
  const translations = i18nData[locale]
  for (const field of fields) {
    const fieldStr = String(field)
    if (fieldStr in translations && translations[fieldStr]) {
      ;(localizedItem as Record<string, unknown>)[fieldStr] = translations[fieldStr]
    }
  }

  return localizedItem
}

/**
 * Apply localization to an array of manifest items
 * @param items - Array of manifest items with potential i18n translations
 * @param locale - The target locale (e.g., 'en', 'zh-Hans')
 * @param fields - Array of field names to localize (default: ['description'])
 * @returns A new array with localized items
 */
export function localizeManifestItems<T extends Record<string, unknown>>(
  items: T[],
  locale: Locale,
  fields?: (keyof T)[]
): T[] {
  return items.map(item => localizeManifestItem(item, locale, fields))
}
