#!/usr/bin/env node

/**
 * Validates that all translation structures are identical
 *
 * This script checks:
 * 1. All translations have the same file structure (same JSON files)
 * 2. All JSON files have the same key structure (same nested keys)
 * 3. Reports any structural differences between translations
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')
const translationsDir = path.join(rootDir, 'translations')

/**
 * Discover all available translations by scanning the translations directory
 * @returns {string[]} - Array of locale codes
 */
function discoverLocales() {
  if (!fs.existsSync(translationsDir)) {
    throw new Error(`Translations directory not found: ${translationsDir}`)
  }

  const entries = fs.readdirSync(translationsDir, { withFileTypes: true })
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

    // Check if it's a valid translation directory (has index.ts)
    const indexPath = path.join(translationsDir, localeName, 'index.ts')
    if (fs.existsSync(indexPath)) {
      locales.push(localeName)
    }
  }

  // Sort for consistent output
  return locales.sort()
}

/**
 * Recursively collect all keys from a JSON object
 * @param {unknown} obj - The object to traverse
 * @param {string} prefix - Current path prefix
 * @param {Set<string>} keys - Set to collect keys
 * @returns {void}
 */
function collectKeys(obj, prefix, keys) {
  if (obj === null || typeof obj !== 'object') {
    return
  }

  if (Array.isArray(obj)) {
    // For arrays, check structure of each item
    obj.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        collectKeys(item, `${prefix}[${index}]`, keys)
      }
    })
    return
  }

  // For objects, collect all keys
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key
    keys.add(fullPath)

    // Recursively collect nested keys
    if (value !== null && typeof value === 'object') {
      collectKeys(value, fullPath, keys)
    }
  }
}

/**
 * Get the structure of a translation (files and keys)
 * @param {string} locale - The locale code
 * @returns {{files: Map<string, Set<string>>, fileList: string[]}} - Structure information
 */
function getLocaleStructure(locale) {
  const localeDir = path.join(translationsDir, locale)
  const files = new Map()
  const fileList = []

  if (!fs.existsSync(localeDir)) {
    throw new Error(`Translation directory not found: ${localeDir}`)
  }

  /**
   * Process a JSON file and collect its keys
   * @param {string} filePath - Path to the JSON file
   * @param {string} relativePath - Relative path for display
   */
  function processJsonFile(filePath, relativePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const json = JSON.parse(content)
      const keys = new Set()
      collectKeys(json, '', keys)
      files.set(relativePath, keys)
      fileList.push(relativePath)
    } catch (error) {
      throw new Error(`Failed to parse ${relativePath}: ${error.message}`)
    }
  }

  // Process root-level JSON files
  const rootFiles = fs.readdirSync(localeDir).filter(file => {
    const filePath = path.join(localeDir, file)
    return fs.statSync(filePath).isFile() && file.endsWith('.json')
  })

  for (const file of rootFiles) {
    const filePath = path.join(localeDir, file)
    processJsonFile(filePath, file)
  }

  // Process pages directory if it exists
  const pagesDir = path.join(localeDir, 'pages')
  if (fs.existsSync(pagesDir) && fs.statSync(pagesDir).isDirectory()) {
    const pagesFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.json'))

    for (const file of pagesFiles) {
      const filePath = path.join(pagesDir, file)
      const relativePath = `pages/${file}`
      processJsonFile(filePath, relativePath)
    }
  }

  // Sort file list for consistent comparison
  fileList.sort()

  return { files, fileList }
}

/**
 * Compare two sets and return differences
 * @param {Set<string>} set1 - First set
 * @param {Set<string>} set2 - Second set
 * @returns {{onlyInFirst: string[], onlyInSecond: string[]}} - Differences
 */
function compareSets(set1, set2) {
  const onlyInFirst = []
  const onlyInSecond = []

  for (const item of set1) {
    if (!set2.has(item)) {
      onlyInFirst.push(item)
    }
  }

  for (const item of set2) {
    if (!set1.has(item)) {
      onlyInSecond.push(item)
    }
  }

  return { onlyInFirst, onlyInSecond }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating translation structures...\n')

  const locales = discoverLocales()

  if (locales.length === 0) {
    console.error('❌ No translations found!')
    process.exit(1)
  }

  if (locales.length === 1) {
    console.log(`⚠️  Only one translation found (${locales[0]}), nothing to compare.`)
    process.exit(0)
  }

  console.log(`Found ${locales.length} translations: ${locales.join(', ')}\n`)

  // Get structure for each translation
  const structures = new Map()
  let hasErrors = false

  for (const locale of locales) {
    try {
      const structure = getLocaleStructure(locale)
      structures.set(locale, structure)
    } catch (error) {
      console.error(`❌ Failed to load structure for ${locale}: ${error.message}`)
      hasErrors = true
    }
  }

  if (hasErrors) {
    process.exit(1)
  }

  // Use the first translation as reference
  const referenceLocale = locales[0]
  const referenceStructure = structures.get(referenceLocale)

  console.log(`Using ${referenceLocale} as reference structure\n`)

  const errors = []

  // Compare each translation with the reference
  for (let i = 1; i < locales.length; i++) {
    const locale = locales[i]
    const structure = structures.get(locale)

    // Compare file lists
    const fileListDiff = compareSets(
      new Set(referenceStructure.fileList),
      new Set(structure.fileList)
    )

    if (fileListDiff.onlyInFirst.length > 0 || fileListDiff.onlyInSecond.length > 0) {
      errors.push({
        locale,
        type: 'file_list',
        missing: fileListDiff.onlyInFirst,
        extra: fileListDiff.onlyInSecond,
      })
    }

    // Compare keys in each file
    const allFiles = new Set([...referenceStructure.fileList, ...structure.fileList])

    for (const file of allFiles) {
      const refKeys = referenceStructure.files.get(file)
      const localeKeys = structure.files.get(file)

      if (!refKeys && localeKeys) {
        errors.push({
          locale,
          type: 'file_missing',
          file,
          message: `File exists in ${locale} but not in ${referenceLocale}`,
        })
        continue
      }

      if (refKeys && !localeKeys) {
        errors.push({
          locale,
          type: 'file_missing',
          file,
          message: `File exists in ${referenceLocale} but not in ${locale}`,
        })
        continue
      }

      if (!refKeys || !localeKeys) {
        continue
      }

      const keyDiff = compareSets(refKeys, localeKeys)

      if (keyDiff.onlyInFirst.length > 0 || keyDiff.onlyInSecond.length > 0) {
        errors.push({
          locale,
          type: 'key_structure',
          file,
          missing: keyDiff.onlyInFirst,
          extra: keyDiff.onlyInSecond,
        })
      }
    }
  }

  // Report errors
  if (errors.length > 0) {
    console.error('❌ Structure differences found:\n')

    for (const error of errors) {
      console.error(`📂 Translation: ${error.locale}`)

      if (error.type === 'file_list') {
        console.error('   Type: File list mismatch')
        if (error.missing.length > 0) {
          console.error(`   Missing files (in ${referenceLocale} but not in ${error.locale}):`)
          error.missing.forEach(file => {
            console.error(`     • ${file}`)
          })
        }
        if (error.extra.length > 0) {
          console.error(`   Extra files (in ${error.locale} but not in ${referenceLocale}):`)
          error.extra.forEach(file => {
            console.error(`     • ${file}`)
          })
        }
      } else if (error.type === 'file_missing') {
        console.error(`   Type: Missing file`)
        console.error(`   File: ${error.file}`)
        console.error(`   ${error.message}`)
      } else if (error.type === 'key_structure') {
        console.error(`   Type: Key structure mismatch`)
        console.error(`   File: ${error.file}`)
        if (error.missing.length > 0) {
          console.error(`   Missing keys (in ${referenceLocale} but not in ${error.locale}):`)
          error.missing.forEach(key => {
            console.error(`     • ${key}`)
          })
        }
        if (error.extra.length > 0) {
          console.error(`   Extra keys (in ${error.locale} but not in ${referenceLocale}):`)
          error.extra.forEach(key => {
            console.error(`     • ${key}`)
          })
        }
      }

      console.error('')
    }

    console.error('='.repeat(70))
    console.error('❌ Validation failed! Translation structures are not identical.')
    console.error('='.repeat(70))
    process.exit(1)
  }

  // Success
  console.log('='.repeat(70))
  console.log('✅ All translation structures are identical!')
  console.log('='.repeat(70))
  console.log(`\nChecked ${locales.length} translations:`)
  locales.forEach(locale => {
    const structure = structures.get(locale)
    console.log(`   • ${locale}: ${structure.fileList.length} files`)
  })
  process.exit(0)
}

try {
  main()
} catch (error) {
  console.error('Fatal error:', error)
  process.exit(1)
}
