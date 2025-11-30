#!/usr/bin/env node

/**
 * Validates manifest JSON files against their corresponding JSON schemas
 * This script runs before build to ensure data integrity
 *
 * Updated to work with the new directory structure where each manifest is a separate file
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')

// Configuration: map manifest directories to their schema files
const MANIFEST_SCHEMA_MAP = {
  clis: 'cli.schema.json',
  ides: 'ide.schema.json',
  extensions: 'extension.schema.json',
  providers: 'provider.schema.json',
  models: 'model.schema.json',
  vendors: 'vendor.schema.json',
}

// Special files that are still single JSON files
const SINGLE_FILE_SCHEMAS = {
  'collections.json': 'collections.schema.json',
}

// Initialize Ajv with Draft 2020-12 support
const ajv = new Ajv2020({
  allErrors: true,
  verbose: true,
  strict: true,
  strictTypes: true,
  allowUnionTypes: true,
})

// Add format validators (for uri, date-time, etc.)
addFormats(ajv)

/**
 * Load base schemas and add them to Ajv
 */
function loadBaseSchema(schemasDir) {
  // Load all ref schemas first
  const refDir = path.join(schemasDir, 'ref')

  // Load translations schema
  const translationsSchemaPath = path.join(refDir, 'translations.schema.json')
  const translationsSchemaContent = fs.readFileSync(translationsSchemaPath, 'utf8')
  const translationsSchema = JSON.parse(translationsSchemaContent)
  ajv.addSchema(translationsSchema, 'translations.schema.json')

  // Load community-urls schema
  const communitySchemaPath = path.join(refDir, 'community-urls.schema.json')
  const communitySchemaContent = fs.readFileSync(communitySchemaPath, 'utf8')
  const communitySchema = JSON.parse(communitySchemaContent)
  ajv.addSchema(communitySchema, 'community-urls.schema.json')

  // Load platform-urls schema (if exists)
  const platformSchemaPath = path.join(refDir, 'platform-urls.schema.json')
  if (fs.existsSync(platformSchemaPath)) {
    const platformSchemaContent = fs.readFileSync(platformSchemaPath, 'utf8')
    const platformSchema = JSON.parse(platformSchemaContent)
    ajv.addSchema(platformSchema, 'platform-urls.schema.json')
  }

  // Load base-info schema (must be loaded before vendor-entity)
  const baseInfoSchemaPath = path.join(refDir, 'entity.schema.json')
  const baseInfoSchemaContent = fs.readFileSync(baseInfoSchemaPath, 'utf8')
  const baseInfoSchema = JSON.parse(baseInfoSchemaContent)
  ajv.addSchema(baseInfoSchema, 'entity.schema.json')

  // Load vendor-entity schema (must be loaded after entity, before product)
  const vendorEntitySchemaPath = path.join(refDir, 'vendor-entity.schema.json')
  if (fs.existsSync(vendorEntitySchemaPath)) {
    const vendorEntitySchemaContent = fs.readFileSync(vendorEntitySchemaPath, 'utf8')
    const vendorEntitySchema = JSON.parse(vendorEntitySchemaContent)
    ajv.addSchema(vendorEntitySchema, 'vendor-entity.schema.json')
  }

  // Load base product schema (must be loaded before base-app)
  const baseSchemaPath = path.join(refDir, 'product.schema.json')
  const baseSchemaContent = fs.readFileSync(baseSchemaPath, 'utf8')
  const baseSchema = JSON.parse(baseSchemaContent)
  ajv.addSchema(baseSchema, 'product.schema.json')

  // Load base app schema (must be loaded after base-product, before clis/ides)
  const baseAppSchemaPath = path.join(refDir, 'app.schema.json')
  if (fs.existsSync(baseAppSchemaPath)) {
    const baseAppSchemaContent = fs.readFileSync(baseAppSchemaPath, 'utf8')
    const baseAppSchema = JSON.parse(baseAppSchemaContent)
    ajv.addSchema(baseAppSchema, 'app.schema.json')
  }

  return baseSchema
}

/**
 * Load and resolve a JSON schema file with $ref support
 */
function loadSchema(schemaPath) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8')
  const schema = JSON.parse(schemaContent)

  // Resolve relative $ref paths
  const schemaDir = path.dirname(schemaPath)
  resolveRefs(schema, schemaDir)

  return schema
}

/**
 * Recursively resolve $ref paths in schema
 */
function resolveRefs(obj, baseDir) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      resolveRefs(item, baseDir)
    }
    return
  }

  if (obj.$ref && typeof obj.$ref === 'string') {
    // Handle relative paths
    if (obj.$ref.startsWith('./')) {
      const refPath = path.resolve(baseDir, obj.$ref)
      if (fs.existsSync(refPath)) {
        const refContent = fs.readFileSync(refPath, 'utf8')
        const refSchema = JSON.parse(refContent)

        // Add the referenced schema to Ajv (only if not already added)
        const refId = path.basename(refPath)
        if (!ajv.getSchema(refId)) {
          ajv.addSchema(refSchema, refId)
        }

        // Update the $ref to use the schema ID
        obj.$ref = refId
      }
    }
  }

  // Recursively process all properties
  for (const value of Object.values(obj)) {
    resolveRefs(value, baseDir)
  }
}

/**
 * Validate a single manifest file (individual JSON file)
 */
function validateSingleFile(filePath, schema, expectedId = null) {
  const validate = ajv.compile(schema)

  // Load manifest data
  const manifestContent = fs.readFileSync(filePath, 'utf8')
  let manifestData
  try {
    manifestData = JSON.parse(manifestContent)
  } catch (error) {
    return {
      valid: false,
      error: `JSON parse error: ${error.message}`,
    }
  }

  // Validate against schema
  const valid = validate(manifestData)
  if (!valid) {
    return {
      valid: false,
      errors: validate.errors,
    }
  }

  // Validate filename matches id field (if expectedId is provided)
  if (expectedId !== null) {
    const actualId = manifestData.id
    if (actualId !== expectedId) {
      return {
        valid: false,
        errors: [
          {
            instancePath: '/id',
            keyword: 'filenameMismatch',
            message: `Filename does not match id field. Expected: "${expectedId}", but found: "${actualId}"`,
            params: {
              expected: expectedId,
              actual: actualId,
            },
          },
        ],
      }
    }
  }

  return { valid: true }
}

/**
 * Validate all files in a manifest directory
 */
function validateManifestDirectory(dirName, schemaFile) {
  const dirPath = path.join(rootDir, 'manifests', dirName)
  const schemaPath = path.join(rootDir, 'manifests', '$schemas', schemaFile)

  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Manifest directory not found: ${dirName}/`)
    return { valid: true, skipped: true }
  }

  if (!fs.existsSync(schemaPath)) {
    console.warn(`⚠️  Schema file not found: ${schemaFile}`)
    return { valid: true, skipped: true }
  }

  // Load schema
  const fullSchema = loadSchema(schemaPath)

  // If the schema is for an array, extract the items schema for individual file validation
  // But preserve $defs from the root schema
  let schema = fullSchema
  if (fullSchema.type === 'array' && fullSchema.items) {
    schema = {
      ...fullSchema.items,
      // Preserve $defs from root schema if they exist
      ...(fullSchema.$defs && { $defs: fullSchema.$defs }),
    }
  }

  // Get all JSON files in the directory
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'))

  if (files.length === 0) {
    console.warn(`⚠️  No JSON files found in ${dirName}/`)
    return { valid: true, skipped: true, itemCount: 0 }
  }

  const errors = []
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    // Extract expected id from filename (remove .json extension)
    const expectedId = path.basename(file, '.json')
    const result = validateSingleFile(filePath, schema, expectedId)

    if (!result.valid) {
      errors.push({
        file,
        error: result.error,
        schemaErrors: result.errors,
      })
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      totalFiles: files.length,
    }
  }

  return {
    valid: true,
    itemCount: files.length,
  }
}

/**
 * Validate a single manifest file (for collections.json, vendors.json)
 */
function validateSingleManifest(manifestFile, schemaFile) {
  const manifestPath = path.join(rootDir, 'manifests', manifestFile)
  const schemaPath = path.join(rootDir, 'manifests', '$schemas', schemaFile)

  // Check if files exist
  if (!fs.existsSync(manifestPath)) {
    console.warn(`⚠️  Manifest file not found: ${manifestFile}`)
    return { valid: true, skipped: true }
  }

  if (!fs.existsSync(schemaPath)) {
    console.warn(`⚠️  Schema file not found: ${schemaFile}`)
    return { valid: true, skipped: true }
  }

  // Load manifest data
  const manifestContent = fs.readFileSync(manifestPath, 'utf8')
  let manifestData
  try {
    manifestData = JSON.parse(manifestContent)
  } catch (error) {
    return {
      valid: false,
      error: `JSON parse error: ${error.message}`,
    }
  }

  // Load and compile schema
  const schema = loadSchema(schemaPath)
  const validate = ajv.compile(schema)

  // Validate
  const valid = validate(manifestData)
  if (!valid) {
    return {
      valid: false,
      schemaErrors: validate.errors,
    }
  }

  return {
    valid: true,
    itemCount: Array.isArray(manifestData) ? manifestData.length : undefined,
  }
}

/**
 * Format validation errors for display
 */
function formatErrors(name, result) {
  console.error(`\n❌ Validation failed for ${name}:`)

  if (result.error) {
    console.error(`   ${result.error}`)
    return
  }

  // Handle directory-level errors
  if (result.errors && Array.isArray(result.errors)) {
    result.errors.forEach(({ file, error, schemaErrors }) => {
      console.error(`\n   File: ${file}`)
      if (error) {
        console.error(`     ${error}`)
      }
      if (schemaErrors) {
        schemaErrors.forEach(err => {
          const path = err.instancePath || '(root)'
          const message = err.message
          const keyword = err.keyword

          if (keyword === 'required') {
            console.error(`     • Missing required field: ${err.params.missingProperty}`)
          } else if (keyword === 'additionalProperties') {
            console.error(
              `     • Additional property not allowed: ${err.params.additionalProperty}`
            )
          } else if (keyword === 'enum') {
            console.error(
              `     • ${path}: ${message} (allowed: ${err.params.allowedValues.join(', ')})`
            )
          } else if (keyword === 'format') {
            console.error(`     • ${path}: ${message} (expected format: ${err.params.format})`)
          } else if (keyword === 'filenameMismatch') {
            console.error(`     • ${path}: ${message}`)
          } else {
            console.error(`     • ${path}: ${message}`)
          }

          if (err.data !== undefined && typeof err.data !== 'object') {
            console.error(`       Current value: ${JSON.stringify(err.data)}`)
          }
        })
      }
    })
    return
  }

  // Handle schema-level errors
  if (result.schemaErrors) {
    result.schemaErrors.forEach(err => {
      const path = err.instancePath || '(root)'
      const message = err.message
      const keyword = err.keyword

      if (keyword === 'required') {
        console.error(`   • Missing required field: ${err.params.missingProperty}`)
      } else if (keyword === 'additionalProperties') {
        console.error(`   • Additional property not allowed: ${err.params.additionalProperty}`)
      } else if (keyword === 'enum') {
        console.error(`   • ${path}: ${message} (allowed: ${err.params.allowedValues.join(', ')})`)
      } else if (keyword === 'format') {
        console.error(`   • ${path}: ${message} (expected format: ${err.params.format})`)
      } else {
        console.error(`   • ${path}: ${message}`)
      }

      if (err.data !== undefined && typeof err.data !== 'object') {
        console.error(`     Current value: ${JSON.stringify(err.data)}`)
      }
    })
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating manifest files...\n')

  // Load base schema first
  const schemasDir = path.join(rootDir, 'manifests', '$schemas')
  loadBaseSchema(schemasDir)

  let hasErrors = false
  let totalValidated = 0
  let totalSkipped = 0

  // Validate manifest directories (new structure)
  for (const [dirName, schemaFile] of Object.entries(MANIFEST_SCHEMA_MAP)) {
    const result = validateManifestDirectory(dirName, schemaFile)

    if (result.skipped) {
      totalSkipped++
      continue
    }

    if (result.valid) {
      console.log(`✅ ${dirName}/ (${result.itemCount} files)`)
      totalValidated++
    } else {
      formatErrors(`${dirName}/`, result)
      hasErrors = true
      totalValidated++
    }
  }

  // Validate single manifest files (old structure)
  for (const [manifestFile, schemaFile] of Object.entries(SINGLE_FILE_SCHEMAS)) {
    const result = validateSingleManifest(manifestFile, schemaFile)

    if (result.skipped) {
      totalSkipped++
      continue
    }

    if (result.valid) {
      const countStr = result.itemCount !== undefined ? ` (${result.itemCount} items)` : ''
      console.log(`✅ ${manifestFile}${countStr}`)
      totalValidated++
    } else {
      formatErrors(manifestFile, result)
      hasErrors = true
      totalValidated++
    }
  }

  console.log(`\n📊 Summary: ${totalValidated} validated, ${totalSkipped} skipped`)

  if (hasErrors) {
    console.error('\n❌ Validation failed! Please fix the errors above.')
    process.exit(1)
  } else {
    console.log('\n✅ All manifest files are valid!')
  }
}

main()
