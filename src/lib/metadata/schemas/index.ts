/**
 * JSON-LD Schema Library
 * Centralized Schema.org structured data generation
 *
 * @example Basic usage
 * ```typescript
 * import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'
 *
 * const schema = await generateSoftwareDetailSchema({
 *   product: ideData,
 *   category: 'ides',
 *   locale: 'en'
 * })
 * ```
 *
 * @example With validation
 * ```typescript
 * import { generateSoftwareDetailSchema, validateAndLog } from '@/lib/metadata/schemas'
 *
 * const schema = await generateSoftwareDetailSchema({ ... })
 * validateAndLog(schema, 'IDE Detail Page')
 * ```
 */

// Export builder types
export type {
  ArticleSchemaOptions,
  BreadcrumbItemData,
  FAQQuestionData,
  ItemListSchemaOptions,
  ListItemData,
  OrganizationSchemaOptions,
  PersonSchemaOptions,
  PricingTierData,
  ProductSchemaOptions,
  RatingData,
  SoftwareApplicationSchemaOptions,
} from './builders'
// Export all builders
export {
  buildAggregateRatingSchema,
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildFAQPageSchema,
  buildItemListSchema,
  buildOffersSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildProductSchema,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema,
} from './builders'
// Export generator types
export type {
  ArticleData,
  ArticleSchemaOptionsInput,
  DocData,
  DocsSchemaOptions,
  ListPageSchemaOptions,
  ModelData,
  ModelDetailSchemaOptions,
  ProductData,
  SoftwareDetailSchemaOptions,
  VendorData,
  VendorSchemaOptions,
} from './generators'
// Export all generators
export {
  generateArticleSchema,
  generateDocsSchema,
  generateFAQPageSchema,
  generateListPageSchema,
  generateModelDetailSchema,
  generateRootOrganizationSchema,
  generateSoftwareDetailSchema,
  generateVendorSchema,
  generateWebSiteSchema,
} from './generators'
// Export all types
export type {
  AnySchema,
  SchemaAggregateRating,
  SchemaAnswer,
  SchemaArticle,
  SchemaAuthor,
  SchemaBase,
  SchemaBreadcrumbList,
  SchemaBreadcrumbListItem,
  SchemaContactPoint,
  SchemaFAQPage,
  SchemaItemList,
  SchemaListItem,
  SchemaOffer,
  SchemaOrganization,
  SchemaPerson,
  SchemaProduct,
  SchemaPublisher,
  SchemaQuestion,
  SchemaReview,
  SchemaSearchAction,
  SchemaSoftwareApplication,
  SchemaWebSite,
} from './types'

// Export validators
export type { ValidationResult } from './validators'
export { validateAndLog, validateOrThrow, validateSchema } from './validators'
