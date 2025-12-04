/**
 * Robots Configuration
 * Centralized robots meta tag configuration for SEO
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#robots
 */

import type { Metadata } from 'next'
import type { PageType } from './templates'

/**
 * Default robots configuration
 * Used for most pages - allows indexing and following links
 */
export const DEFAULT_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  nocache: false,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1, // No limit on snippet length
    'max-video-preview': -1, // No limit on video preview length
  },
}

/**
 * No-index robots configuration
 * Used for pages that shouldn't appear in search results
 */
export const NOINDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: true,
  nocache: true,
  googleBot: {
    index: false,
    follow: true,
  },
}

/**
 * No-follow robots configuration
 * Used for pages with user-generated or untrusted content
 */
export const NOFOLLOW_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: false,
  googleBot: {
    index: true,
    follow: false,
  },
}

/**
 * Page-specific robots configuration
 * Returns appropriate robots configuration based on page type
 */
export function getPageRobots(pageType: PageType): Metadata['robots'] {
  switch (pageType) {
    case 'search':
      // Search result pages should not be indexed
      return NOINDEX_ROBOTS
    default:
      // All other pages use default indexing
      return DEFAULT_ROBOTS
  }
}

/**
 * Get custom robots configuration
 * For special cases where page-specific robots rules are needed
 */
export function getCustomRobots(options: {
  index?: boolean
  follow?: boolean
  nocache?: boolean
  maxImagePreview?: 'none' | 'standard' | 'large'
  maxSnippet?: number
  maxVideoPreview?: number
}): Metadata['robots'] {
  return {
    index: options.index ?? true,
    follow: options.follow ?? true,
    nocache: options.nocache ?? false,
    googleBot: {
      index: options.index ?? true,
      follow: options.follow ?? true,
      'max-image-preview': options.maxImagePreview ?? 'large',
      'max-snippet': options.maxSnippet ?? -1,
      'max-video-preview': options.maxVideoPreview ?? -1,
    },
  }
}
