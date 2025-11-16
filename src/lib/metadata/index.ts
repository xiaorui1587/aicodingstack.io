/**
 * Metadata Library
 * Centralized metadata generation utilities for AI Coding Stack
 *
 * @example
 * // Import generators for specific page types
 * import { generateListPageMetadata, generateSoftwareDetailMetadata } from '@/lib/metadata';
 *
 * // Use in page components
 * export async function generateMetadata({ params }) {
 *   return await generateListPageMetadata({
 *     locale: params.locale,
 *     category: 'ides',
 *     translationNamespace: 'stacksPages.ides',
 *   });
 * }
 */

// Export all generators
export {
  generateListPageMetadata,
  generateSoftwareDetailMetadata,
  generateModelDetailMetadata,
  generateComparisonMetadata,
  generateArticleMetadata,
  generateDocsMetadata,
} from './generators';

// Export all helpers
export {
  mapLocaleToOG,
  getAlternateOGLocale,
  buildTitle,
  buildListPageTitle,
  buildDetailPageTitle,
  buildKeywords,
  buildCanonicalUrl,
  buildLanguageAlternates,
  buildFullUrl,
  buildOGImage,
  getOGImagePath,
  buildOpenGraph,
  buildTwitterCard,
  buildAlternates,
  formatPriceForDescription,
  formatPlatforms,
  buildProductDescription,
} from './helpers';

// Export configuration
export {
  SITE_CONFIG,
  OG_IMAGE_CONFIG,
  METADATA_DEFAULTS,
  CATEGORY_SEO_KEYWORDS,
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_EXAMPLES,
  type Category,
  type Locale,
} from './config';
