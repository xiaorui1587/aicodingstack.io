/**
 * Search utilities for AI Coding Stack
 * Provides unified search across all product categories
 */

import type {
  ManifestCLI,
  ManifestExtension,
  ManifestIDE,
  ManifestModel,
  ManifestProvider,
  ManifestVendor,
} from '@/types/manifests'
import {
  clisData,
  extensionsData,
  idesData,
  modelsData,
  providersData,
  vendorsData,
} from './generated'

export type SearchCategory = 'ides' | 'clis' | 'extensions' | 'models' | 'providers' | 'vendors'

export interface SearchResult {
  id: string
  name: string
  description: string
  category: SearchCategory
  data:
    | ManifestIDE
    | ManifestCLI
    | ManifestExtension
    | ManifestModel
    | ManifestProvider
    | ManifestVendor
}

/**
 * Get localized name from manifest with fallback to default name
 */
function getLocalizedName(
  item: { name: string; translations?: { [locale: string]: { name?: string } } },
  locale?: string
): string {
  if (locale && item.translations?.[locale]?.name) {
    return item.translations[locale].name
  }
  return item.name
}

/**
 * Check if query matches item name (supports translations)
 */
function matchesQuery(
  item: {
    name: string
    description: string
    translations?: { [locale: string]: { name?: string; description?: string } }
  },
  query: string
): boolean {
  const lowerQuery = query.toLowerCase()

  // Search in default name only
  if (item.name.toLowerCase().includes(lowerQuery)) return true

  // Search in translations (name only)
  if (item.translations) {
    for (const translation of Object.values(item.translations)) {
      if (translation.name?.toLowerCase().includes(lowerQuery)) return true
    }
  }

  return false
}

/**
 * Calculate relevance score for sorting results
 * Higher score = more relevant
 */
function calculateRelevance(
  item: {
    name: string
    description: string
    i18n?: { [locale: string]: { name?: string; description?: string } }
  },
  query: string,
  locale?: string
): number {
  const lowerQuery = query.toLowerCase()
  const name = getLocalizedName(item, locale).toLowerCase()

  // Exact match in name
  if (name === lowerQuery) return 100

  // Starts with query in name
  if (name.startsWith(lowerQuery)) return 90

  // Contains query in name
  if (name.includes(lowerQuery)) return 80

  return 0
}

/**
 * Build unified search index from all product manifests
 */
export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = []

  // Add IDEs
  for (const ide of idesData) {
    results.push({
      id: ide.id,
      name: ide.name,
      description: ide.description,
      category: 'ides',
      data: ide,
    })
  }

  // Add CLIs
  for (const cli of clisData) {
    results.push({
      id: cli.id,
      name: cli.name,
      description: cli.description,
      category: 'clis',
      data: cli,
    })
  }

  // Add Extensions
  for (const extension of extensionsData) {
    results.push({
      id: extension.id,
      name: extension.name,
      description: extension.description,
      category: 'extensions',
      data: extension,
    })
  }

  // Add Models
  for (const model of modelsData) {
    results.push({
      id: model.id,
      name: model.name,
      description: model.description,
      category: 'models',
      data: model,
    })
  }

  // Add Providers
  for (const provider of providersData) {
    results.push({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      category: 'providers',
      data: provider,
    })
  }

  // Add Vendors
  for (const vendor of vendorsData) {
    results.push({
      id: vendor.id,
      name: vendor.name,
      description: vendor.description,
      category: 'vendors',
      data: vendor,
    })
  }

  return results
}

/**
 * Search across all products
 * @param query - Search query string
 * @param locale - Optional locale for i18n search
 * @returns Array of search results sorted by relevance
 */
export function search(query: string, locale?: string): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const index = buildSearchIndex()
  const results = index
    .filter(item => matchesQuery(item.data, query))
    .map(item => ({
      ...item,
      relevance: calculateRelevance(item.data, query, locale),
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .map(({ relevance, ...item }) => item)

  return results
}

/**
 * Generate autocomplete suggestions based on query
 * @param query - Search query string
 * @param locale - Optional locale for i18n search
 * @param limit - Maximum number of suggestions (default: 8)
 * @returns Array of suggested product names
 */
export function getAutocompleteSuggestions(
  query: string,
  locale?: string,
  limit: number = 8
): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const results = search(query, locale)
  return results.slice(0, limit)
}
