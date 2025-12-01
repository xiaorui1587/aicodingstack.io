#!/usr/bin/env node

/**
 * Validates TypeScript type definitions alignment with JSON schemas
 * This script checks that TypeScript types match the JSON schema definitions
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')

const SCHEMAS_DIR = path.join(rootDir, 'manifests/$schemas')
const TYPES_FILE = path.join(rootDir, 'src/types/manifests.ts')

/**
 * Load and parse a JSON schema file
 */
function loadSchema(schemaPath) {
  try {
    const content = fs.readFileSync(schemaPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error loading schema ${schemaPath}:`, error.message)
    return null
  }
}

/**
 * Extract required fields from a schema
 */
function getRequiredFields(schema, schemaPath = '') {
  const required = new Set()

  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      required.add(field)
    }
  }

  // Handle allOf (inheritance)
  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const subSchema of schema.allOf) {
      if (subSchema.$ref) {
        // Resolve reference relative to the current schema's directory
        const schemaDir = schemaPath ? path.dirname(schemaPath) : SCHEMAS_DIR
        const refPath = path.resolve(schemaDir, subSchema.$ref)
        const refSchema = loadSchema(refPath)
        if (refSchema) {
          const refRequired = getRequiredFields(refSchema, refPath)
          for (const field of refRequired) {
            required.add(field)
          }
        }
      } else {
        const subRequired = getRequiredFields(subSchema, schemaPath)
        for (const field of subRequired) {
          required.add(field)
        }
      }
    }
  }

  return required
}

/**
 * Extract property types from a schema
 */
function getPropertyTypes(schema, schemaPath = '') {
  const types = {}

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      if (value.$ref) {
        // Handle references - just mark as referenced
        types[key] = { type: 'ref', ref: value.$ref }
      } else if (value.type) {
        types[key] = {
          type: Array.isArray(value.type) ? value.type : [value.type],
          nullable: Array.isArray(value.type) && value.type.includes('null'),
        }
      }
    }
  }

  // Handle allOf
  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const subSchema of schema.allOf) {
      if (subSchema.$ref) {
        // Resolve reference relative to the current schema's directory
        const schemaDir = schemaPath ? path.dirname(schemaPath) : SCHEMAS_DIR
        const refPath = path.resolve(schemaDir, subSchema.$ref)
        const refSchema = loadSchema(refPath)
        if (refSchema) {
          Object.assign(types, getPropertyTypes(refSchema, refPath))
        }
      } else {
        Object.assign(types, getPropertyTypes(subSchema, schemaPath))
      }
    }
  }

  return types
}

/**
 * Parse TypeScript interface to extract field information
 */
function parseTypeScriptInterface(content, interfaceName) {
  // Find the interface declaration
  const interfaceRegex = new RegExp(
    `export\\s+interface\\s+${interfaceName}\\s*(?:extends\\s+([^{]+?))?\\s*\\{`,
    's'
  )
  const match = content.match(interfaceRegex)

  if (!match) {
    return null
  }

  const extendsClause = match[1]?.trim()

  // Find the interface body by counting braces
  const startIndex = match.index + match[0].length
  let braceCount = 1
  let endIndex = startIndex

  while (braceCount > 0 && endIndex < content.length) {
    if (content[endIndex] === '{') braceCount++
    if (content[endIndex] === '}') braceCount--
    endIndex++
  }

  const interfaceBody = content.substring(startIndex, endIndex - 1)
  const fields = {}

  // Parse fields from this interface - split by lines and process each
  const lines = interfaceBody.split('\n')
  for (const line of lines) {
    const trimmedLine = line.trim()
    // Match field declarations: name: type or name?: type
    const fieldMatch = trimmedLine.match(/^(\w+)(\?)?\s*:\s*(.+)$/)
    if (fieldMatch) {
      const [, name, optional, type] = fieldMatch
      fields[name] = {
        optional: optional === '?',
        type: type.trim(),
      }
    }
  }

  // If this interface extends another, recursively get parent fields
  if (extendsClause) {
    // Handle multiple inheritance (e.g., "extends A, B")
    const parentInterfaces = extendsClause.split(',').map(i => i.trim())
    for (const parentName of parentInterfaces) {
      const parentFields = parseTypeScriptInterface(content, parentName)
      if (parentFields) {
        // Parent fields come first, but can be overridden by child
        for (const [key, value] of Object.entries(parentFields)) {
          if (!(key in fields)) {
            fields[key] = value
          }
        }
      }
    }
  }

  return fields
}

/**
 * Check alignment between schema and TypeScript type
 */
function checkAlignment(schemaPath, interfaceName, _schemaName) {
  const schema = loadSchema(schemaPath)
  if (!schema) {
    return { valid: false, error: 'Failed to load schema' }
  }

  const typesContent = fs.readFileSync(TYPES_FILE, 'utf8')
  const tsFields = parseTypeScriptInterface(typesContent, interfaceName)

  if (!tsFields) {
    return { valid: false, error: `Interface ${interfaceName} not found in types file` }
  }

  const requiredFields = getRequiredFields(schema, schemaPath)
  const schemaProperties = getPropertyTypes(schema, schemaPath)

  const issues = []

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in tsFields)) {
      issues.push({
        type: 'missing_field',
        field,
        message: `Required field '${field}' from schema is missing in TypeScript interface`,
      })
    } else if (tsFields[field].optional) {
      issues.push({
        type: 'optional_required',
        field,
        message: `Field '${field}' is required in schema but optional in TypeScript interface`,
      })
    }
  }

  // Check field name alignment (translations vs i18n)
  if ('translations' in schemaProperties && !('translations' in tsFields) && 'i18n' in tsFields) {
    issues.push({
      type: 'field_name_mismatch',
      field: 'translations',
      message: "Schema uses 'translations' but TypeScript uses 'i18n'",
    })
  }

  return {
    valid: issues.length === 0,
    issues,
    requiredFields: Array.from(requiredFields),
    tsFields: Object.keys(tsFields),
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating TypeScript types alignment with JSON schemas...\n')

  const checks = [
    {
      schema: path.join(SCHEMAS_DIR, 'ref/entity.schema.json'),
      interface: 'ManifestEntity',
      name: 'Base Entity',
    },
    {
      schema: path.join(SCHEMAS_DIR, 'ref/vendor-entity.schema.json'),
      interface: 'ManifestVendorEntity',
      name: 'Vendor Entity',
    },
    {
      schema: path.join(SCHEMAS_DIR, 'ref/product.schema.json'),
      interface: 'ManifestBaseProduct',
      name: 'Base Product',
    },
    {
      schema: path.join(SCHEMAS_DIR, 'ide.schema.json'),
      interface: 'ManifestIDE',
      name: 'IDE',
    },
    {
      schema: path.join(SCHEMAS_DIR, 'cli.schema.json'),
      interface: 'ManifestCLI',
      name: 'CLI',
    },
  ]

  let totalIssues = 0
  let passedChecks = 0

  for (const check of checks) {
    const result = checkAlignment(check.schema, check.interface, check.name)

    if (result.valid) {
      console.log(`✅ ${check.name} (${check.interface}) - aligned`)
      passedChecks++
    } else {
      console.log(`❌ ${check.name} (${check.interface}) - issues found:`)
      if (result.issues) {
        for (const issue of result.issues) {
          console.log(`   - ${issue.message}`)
          totalIssues++
        }
      } else if (result.error) {
        console.log(`   - ${result.error}`)
        totalIssues++
      }
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Passed: ${passedChecks}/${checks.length}`)
  console.log(`   Issues: ${totalIssues}`)

  if (totalIssues > 0) {
    console.log(`\n⚠️  Type alignment issues found. Please review and fix.`)
    process.exit(1)
  } else {
    console.log(`\n✅ All type definitions are aligned with schemas!`)
    process.exit(0)
  }
}

main()
