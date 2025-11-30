#!/usr/bin/env node

/**
 * Validates i18n reference syntax in locale files
 *
 * This script checks:
 * 1. All @:path references point to valid paths
 * 2. All @.modifier:path references use valid modifiers
 * 3. No circular references exist
 * 4. Referenced values are strings (not objects/arrays)
 *
 * Uses shared logic from src/i18n/lib-core.mjs to follow DRY principle
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractReferences, getValueByPath, resolveReference } from '../../src/i18n/lib-core.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')
const localesDir = path.join(rootDir, 'locales')

/**
 * Discover all available locales by scanning the locales directory
 * A locale is valid if:
 * 1. It's a directory (not a file)
 * 2. It's not in the exclude list (e.g., _archive)
 * 3. It contains an index.ts file
 * @returns {string[]} - Array of locale codes
 */
function discoverLocales() {
  if (!fs.existsSync(localesDir)) {
    throw new Error(`Locales directory not found: ${localesDir}`)
  }

  const entries = fs.readdirSync(localesDir, { withFileTypes: true })
  const locales = []

  for (const entry of entries) {
    // Skip files and special directories
    if (!entry.isDirectory()) {
      continue
    }

    const localeName = entry.name

    // Skip special directories
    if (localeName.startsWith('_') || localeName.startsWith('.')) {
      continue
    }

    // Check if it's a valid locale directory (has index.ts)
    const indexPath = path.join(localesDir, localeName, 'index.ts')
    if (fs.existsSync(indexPath)) {
      locales.push(localeName)
    }
  }

  // Sort for consistent output
  return locales.sort()
}

// Discover locales dynamically
const LOCALES = discoverLocales()

/**
 * Load a JSON file and parse it
 * @param {string} filePath - Path to the JSON file
 * @returns {unknown} - Parsed JSON content
 */
function loadJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/**
 * Convert kebab-case filename to camelCase key
 * @param {string} filename - Filename without extension
 * @returns {string} - CamelCase key
 */
function toCamelCase(filename) {
  return filename.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Load messages from a locale by dynamically reading JSON files
 * This mimics the structure in locales/{locale}/index.ts
 * @param {string} locale - The locale code
 * @returns {{messages: Record<string, unknown>, fileMap: Map<string, string>}} - The messages object and file mapping
 */
function loadMessages(locale) {
  const localeDir = path.join(localesDir, locale)

  if (!fs.existsSync(localeDir)) {
    throw new Error(`Locale directory not found: ${localeDir}`)
  }

  const messages = {}
  const fileMap = new Map() // Maps message path to source file path

  /**
   * Recursively mark all paths in an object with a file path
   * @param {unknown} obj - The object to mark
   * @param {string} prefix - The path prefix
   * @param {string} filePath - The source file path
   */
  function markPaths(obj, prefix, filePath) {
    if (typeof obj === 'string') {
      fileMap.set(prefix, filePath)
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        markPaths(item, `${prefix}[${index}]`, filePath)
      })
    } else if (obj !== null && typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        const newPath = prefix ? `${prefix}.${key}` : key
        markPaths(val, newPath, filePath)
      }
    }
  }

  // Load root-level JSON files
  const rootFiles = fs.readdirSync(localeDir).filter(file => {
    const filePath = path.join(localeDir, file)
    return fs.statSync(filePath).isFile() && file.endsWith('.json')
  })

  for (const file of rootFiles) {
    const filePath = path.join(localeDir, file)
    const key = path.basename(file, '.json')
    const content = loadJsonFile(filePath)

    if (key === 'shared') {
      // Special handling for shared.json
      messages.shared = content
      markPaths(content, 'shared', filePath)
      // Legacy keys from shared
      if (content.dict) {
        messages.common = content.dict.common
        messages.stacks = content.dict.stacks
        messages.community = content.dict.platforms
        markPaths(content.dict.common, 'common', filePath)
        markPaths(content.dict.stacks, 'stacks', filePath)
        markPaths(content.dict.platforms, 'community', filePath)
      }
      if (content.header) {
        messages.header = content.header
        markPaths(content.header, 'header', filePath)
      }
      if (content.footer) {
        messages.footer = content.footer
        markPaths(content.footer, 'footer', filePath)
      }
      if (content.search) {
        messages.search = content.search
        markPaths(content.search, 'search', filePath)
      }
      if (content.license) {
        messages.license = content.license
        markPaths(content.license, 'license', filePath)
      }
    } else {
      // Other root-level files (e.g., components.json)
      messages[key] = content
      markPaths(content, key, filePath)
    }
  }

  // Load pages directory if it exists
  const pagesDir = path.join(localeDir, 'pages')
  if (fs.existsSync(pagesDir) && fs.statSync(pagesDir).isDirectory()) {
    const pagesFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.json'))

    // Initialize pages object
    if (!messages.pages) {
      messages.pages = {}
    }

    for (const file of pagesFiles) {
      const filePath = path.join(pagesDir, file)
      const key = path.basename(file, '.json')
      const camelKey = toCamelCase(key)
      const content = loadJsonFile(filePath)

      if (key === 'stacks') {
        // Special handling for stacks.json
        // Stack-related content (combined for backward compatibility)
        messages.stacksPages = {
          overview: content.overview,
          ides: content.ides,
          clis: content.clis,
          extensions: content.extensions,
          models: content.models,
          modelProviders: content.modelProviders,
          vendors: content.vendors,
        }

        messages.stackDetailPages = {
          ideDetail: content.ideDetail,
          cliDetail: content.cliDetail,
          extensionDetail: content.extensionDetail,
          modelDetail: content.modelDetail,
          vendorDetail: content.vendorDetail,
          modelProviderDetail: content.modelProviderDetail,
        }
        markPaths(messages.stacksPages, 'stacksPages', filePath)
        markPaths(messages.stackDetailPages, 'stackDetailPages', filePath)
      } else if (key === 'comparison') {
        // Comparison is at root level, not in pages
        messages.comparison = content
        markPaths(content, 'comparison', filePath)
      } else {
        // Other pages go into pages object
        messages.pages[camelKey] = content
        markPaths(content, `pages.${camelKey}`, filePath)
      }
    }
  }

  return { messages, fileMap }
}

/**
 * Recursively collect all string values from a messages object with their paths
 * @param {unknown} value - The value to traverse
 * @param {string} currentPath - Current path in the object
 * @param {Array<{path: string, value: string}>} strings - Array to collect strings
 * @returns {void}
 */
function collectStrings(value, currentPath, strings) {
  if (typeof value === 'string') {
    strings.push({ path: currentPath, value })
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStrings(item, `${currentPath}[${index}]`, strings)
    })
  } else if (value !== null && typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key
      collectStrings(val, newPath, strings)
    }
  }
}

/**
 * Find similar paths in messages object (for suggestions)
 * @param {string} targetPath - The path that was not found
 * @param {Record<string, unknown>} messages - The messages object
 * @param {number} maxSuggestions - Maximum number of suggestions
 * @returns {string[]} - Array of similar paths
 */
function findSimilarPaths(targetPath, messages, maxSuggestions = 3) {
  const _suggestions = []
  const targetParts = targetPath.split('.')
  const targetLast = targetParts[targetParts.length - 1]

  /**
   * Recursively collect all paths in the messages object
   * @param {unknown} obj - The object to traverse
   * @param {string} currentPath - Current path
   * @param {string[]} paths - Array to collect paths
   */
  function collectPaths(obj, currentPath, paths) {
    if (typeof obj === 'string') {
      paths.push(currentPath)
    } else if (Array.isArray(obj)) {
      // Skip arrays
    } else if (obj !== null && typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        const newPath = currentPath ? `${currentPath}.${key}` : key
        collectPaths(val, newPath, paths)
      }
    }
  }

  const allPaths = []
  collectPaths(messages, '', allPaths)

  // Score paths by similarity
  const scored = allPaths.map(p => {
    const parts = p.split('.')
    const last = parts[parts.length - 1]
    let score = 0

    // Exact match on last part
    if (last === targetLast) score += 10
    // Partial match on last part
    else if (last.includes(targetLast) || targetLast.includes(last)) score += 5

    // Same length
    if (parts.length === targetParts.length) score += 2
    // Similar structure (same first parts)
    const commonPrefix = parts.filter((p, i) => p === targetParts[i]).length
    score += commonPrefix

    return { path: p, score }
  })

  // Sort by score and return top suggestions
  return scored
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(p => p.path)
}

/**
 * Validate references in a locale
 * @param {string} locale - The locale code
 * @returns {{errors: Array<{path: string, filePath: string, message: string, suggestion?: string}>, warnings: Array<{path: string, filePath: string, message: string}>}}
 */
function validateLocale(locale) {
  const errors = []
  const warnings = []

  try {
    // Load messages by reading JSON files directly
    const { messages, fileMap } = loadMessages(locale)

    // Collect all strings with their paths
    const strings = []
    collectStrings(messages, '', strings)

    // Track which paths have validation errors to avoid duplicate reporting
    const validationErrors = new Set()

    // Validate each string
    for (const { path: stringPath, value } of strings) {
      const references = extractReferences(value)
      const sourceFile = fileMap.get(stringPath) || 'unknown'

      for (const ref of references) {
        try {
          // Check if path exists
          const referencedValue = getValueByPath(messages, ref.path)

          // Check if referenced value is a string
          if (typeof referencedValue !== 'string') {
            const actualType = Array.isArray(referencedValue) ? 'array' : typeof referencedValue
            const suggestion = `The path "${ref.path}" exists but points to a ${actualType}, not a string. You can only reference string values.`

            errors.push({
              path: stringPath,
              filePath: sourceFile,
              message: `Invalid reference type`,
              details: `Reference "${ref.match}" in path "${stringPath}" points to a ${actualType} at "${ref.path}"`,
              suggestion,
            })
            validationErrors.add(`${stringPath}:${ref.match}`)
            continue
          }

          // Check modifier validity (extractReferences already validates syntax)
          if (ref.modifier && !['upper', 'lower', 'capitalize'].includes(ref.modifier)) {
            errors.push({
              path: stringPath,
              filePath: sourceFile,
              message: `Invalid modifier`,
              details: `Modifier "${ref.modifier}" in reference "${ref.match}" is not supported`,
              suggestion: `Use one of: upper, lower, capitalize. Example: @.upper:${ref.path}`,
            })
            validationErrors.add(`${stringPath}:${ref.match}`)
          }
        } catch (_error) {
          // Path doesn't exist or is invalid
          const similarPaths = findSimilarPaths(ref.path, messages, 3)
          let suggestion = `The path "${ref.path}" does not exist in the locale messages.`

          if (similarPaths.length > 0) {
            suggestion += `\n   Did you mean one of these?\n${similarPaths.map(p => `   • ${p}`).join('\n')}`
          } else {
            suggestion += `\n   Check that the path is correct and the referenced key exists in your locale files.`
          }

          errors.push({
            path: stringPath,
            filePath: sourceFile,
            message: `Path not found`,
            details: `Reference "${ref.match}" in path "${stringPath}" points to non-existent path "${ref.path}"`,
            suggestion,
          })
          validationErrors.add(`${stringPath}:${ref.match}`)
        }
      }
    }

    // Test full resolution to catch circular references and other runtime errors
    // Skip paths that already have validation errors to avoid duplicate reporting
    try {
      // Create a copy to avoid modifying the original
      const messagesCopy = JSON.parse(JSON.stringify(messages))
      for (const { path: stringPath, value } of strings) {
        // Check if this path already has validation errors
        const references = extractReferences(value)
        const hasValidationError = references.some(ref =>
          validationErrors.has(`${stringPath}:${ref.match}`)
        )

        if (hasValidationError) {
          // Skip resolution test for paths with validation errors
          continue
        }

        try {
          resolveReference(value, messagesCopy, [])
        } catch (error) {
          const sourceFile = fileMap.get(stringPath) || 'unknown'
          let suggestion = ''

          if (error.message.includes('Circular reference')) {
            suggestion = `A circular reference was detected. Check the reference chain and break the cycle by using a direct string value instead of a reference.`
          } else if (error.message.includes('non-string')) {
            suggestion = `The referenced path points to a non-string value. Only string values can be referenced.`
          } else {
            suggestion = `Check the reference syntax and ensure all referenced paths exist and are valid strings.`
          }

          errors.push({
            path: stringPath,
            filePath: sourceFile,
            message: `Resolution failed`,
            details: `Failed to resolve references in "${stringPath}": ${error.message}`,
            suggestion,
          })
        }
      }
    } catch (error) {
      errors.push({
        path: 'root',
        filePath: 'unknown',
        message: `Resolution error`,
        details: `Failed to resolve references: ${error.message}`,
        suggestion: `Check for syntax errors or circular references in your locale files.`,
      })
    }
  } catch (error) {
    errors.push({
      path: 'root',
      filePath: 'unknown',
      message: `Load error`,
      details: `Failed to load locale ${locale}: ${error.message}`,
      suggestion: `Check that the locale directory exists and all JSON files are valid.`,
    })
  }

  return { errors, warnings }
}

/**
 * Format file path for display (relative to project root)
 * @param {string} filePath - Absolute file path
 * @returns {string} - Relative path or original if not in project
 */
function formatFilePath(filePath) {
  if (filePath === 'unknown') return filePath
  try {
    const relative = path.relative(rootDir, filePath)
    return relative.startsWith('..') ? filePath : relative
  } catch {
    return filePath
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating i18n reference syntax in locale files...\n')

  let totalErrors = 0
  let totalWarnings = 0
  const localeResults = []

  for (const locale of LOCALES) {
    console.log(`\n📂 Checking locale: ${locale}`)
    const result = validateLocale(locale)
    localeResults.push({ locale, ...result })

    if (result.errors.length > 0) {
      console.error(`   ❌ Found ${result.errors.length} error(s):\n`)
      for (let i = 0; i < result.errors.length; i++) {
        const error = result.errors[i]
        const filePath = formatFilePath(error.filePath)

        console.error(`   ${i + 1}. ${error.message}`)
        console.error(`      📍 Location: ${error.path}`)
        console.error(`      📄 File: ${filePath}`)
        console.error(`      ℹ️  Details: ${error.details}`)
        if (error.suggestion) {
          console.error(`      💡 Suggestion:`)
          // Indent each line of suggestion
          const suggestionLines = error.suggestion.split('\n')
          for (const line of suggestionLines) {
            console.error(`         ${line}`)
          }
        }
        if (i < result.errors.length - 1) {
          console.error('') // Empty line between errors
        }
      }
      totalErrors += result.errors.length
    }

    if (result.warnings.length > 0) {
      console.warn(`   ⚠️  Found ${result.warnings.length} warning(s):`)
      for (const warning of result.warnings) {
        const filePath = formatFilePath(warning.filePath)
        console.warn(`      • [${warning.path}] in ${filePath}: ${warning.message}`)
      }
      totalWarnings += result.warnings.length
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`   ✅ All references valid`)
    }
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`)
  console.log('📊 Summary:')
  console.log(`   Locales checked: ${LOCALES.length}`)
  console.log(`   Total errors: ${totalErrors}`)
  console.log(`   Total warnings: ${totalWarnings}`)
  console.log('='.repeat(70))

  if (totalErrors > 0) {
    console.error('\n❌ Validation failed! Please fix the errors above.\n')
    console.error('📖 Quick Reference Guide:')
    console.error('   • Reference format: @:path.to.value or @.modifier:path.to.value')
    console.error('   • Valid modifiers: upper, lower, capitalize')
    console.error('   • Only string values can be referenced (not objects/arrays)')
    console.error('   • Avoid circular references (A -> B -> A)')
    console.error('   • Common paths: shared.*, components.*, pages.*')
    process.exit(1)
  } else if (totalWarnings > 0) {
    console.warn('\n⚠️  Validation completed with warnings.')
    process.exit(0)
  } else {
    console.log('\n✅ All i18n references are valid!')
    process.exit(0)
  }
}

try {
  main()
} catch (error) {
  console.error('Fatal error:', error)
  process.exit(1)
}
