#!/usr/bin/env node

/**
 * I18n Duplicate Analysis Script
 *
 * Analyzes English locale files to find duplicate translation values
 * and suggests consolidation opportunities.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const LOCALE_DIR = path.join(process.cwd(), 'locales', 'en')
const MIN_VALUE_LENGTH = 3 // Minimum string length to consider
const _EXCLUDE_PATTERNS = [
  /^@:/, // Already using references
]

/**
 * Recursively reads all JSON files from a directory
 */
function getAllJsonFiles(dir, baseDir = dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...getAllJsonFiles(fullPath, baseDir))
    } else if (item.endsWith('.json')) {
      const relativePath = path.relative(baseDir, fullPath)
      files.push(relativePath)
    }
  }

  return files
}

/**
 * Flattens a nested object into dot-notation paths
 */
function flattenObject(obj, prefix = '') {
  const result = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else {
      result[newKey] = value
    }
  }

  return result
}

/**
 * Determines the namespace from file path
 */
function getNamespace(filePath) {
  if (filePath === 'shared.json') return 'shared'
  if (filePath === 'components.json') return 'components'
  if (filePath.startsWith('pages/')) {
    const pageName = path.basename(filePath, '.json')
    return `pages.${pageName}`
  }
  return path.basename(filePath, '.json')
}

/**
 * Main analysis function
 */
function analyzeDuplicates() {
  console.log('🔍 Analyzing English locale files for duplicates...\n')
  console.log(`📁 Locale directory: ${LOCALE_DIR}\n`)

  // Check if directory exists
  if (!fs.existsSync(LOCALE_DIR)) {
    console.error(`❌ Error: Locale directory not found: ${LOCALE_DIR}`)
    process.exit(1)
  }

  // Get all JSON files
  const jsonFiles = getAllJsonFiles(LOCALE_DIR)
  console.log(`📄 Found ${jsonFiles.length} JSON files\n`)

  // Build a map of all translation keys and their values
  const allTranslations = new Map() // value -> [{file, key, fullKey}]
  const stats = {
    totalKeys: 0,
    totalFiles: jsonFiles.length,
    references: 0,
  }

  for (const file of jsonFiles) {
    const filePath = path.join(LOCALE_DIR, file)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const flattened = flattenObject(content)
    const namespace = getNamespace(file)

    for (const [key, value] of Object.entries(flattened)) {
      stats.totalKeys++

      // Skip references
      if (typeof value === 'string' && value.startsWith('@:')) {
        stats.references++
        continue
      }

      // Skip short values
      if (typeof value === 'string' && value.length < MIN_VALUE_LENGTH) {
        continue
      }

      // Only process string values
      if (typeof value !== 'string') {
        continue
      }

      const fullKey = `${namespace}.${key}`

      if (!allTranslations.has(value)) {
        allTranslations.set(value, [])
      }

      allTranslations.get(value).push({
        file,
        key,
        fullKey,
        value,
      })
    }
  }

  // Find duplicates
  const duplicates = []
  for (const [value, locations] of allTranslations.entries()) {
    if (locations.length > 1) {
      duplicates.push({
        value,
        count: locations.length,
        locations,
      })
    }
  }

  // Sort by count (most duplicates first)
  duplicates.sort((a, b) => b.count - a.count)

  // Print statistics
  console.log('📊 STATISTICS')
  console.log('═'.repeat(80))
  console.log(`Total files:              ${stats.totalFiles}`)
  console.log(`Total translation keys:   ${stats.totalKeys}`)
  console.log(`Already using references: ${stats.references}`)
  console.log(`Unique values:            ${allTranslations.size}`)
  console.log(`Duplicate values found:   ${duplicates.length}`)
  console.log(
    `Potential savings:        ${duplicates.reduce((sum, d) => sum + (d.count - 1), 0)} keys\n`
  )

  // Print duplicates by category
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Your translations are well optimized.\n')
    return
  }

  console.log('🔄 DUPLICATE VALUES')
  console.log('═'.repeat(80))
  console.log('(Showing values that appear in multiple places)\n')

  // Categorize duplicates
  const exactDuplicates = duplicates.filter(d => !d.value.includes('{'))
  const parameterizedDuplicates = duplicates.filter(d => d.value.includes('{'))

  // Show exact duplicates
  if (exactDuplicates.length > 0) {
    console.log('📌 EXACT DUPLICATES')
    console.log('─'.repeat(80))
    console.log('These values are identical and can be consolidated:\n')

    for (const dup of exactDuplicates.slice(0, 20)) {
      console.log(`Value: "${dup.value}"`)
      console.log(`Count: ${dup.count} occurrences`)
      console.log(`Locations:`)
      for (const loc of dup.locations) {
        console.log(`  - ${loc.fullKey}`)
      }

      // Suggest consolidation
      const suggestedKey = findBestConsolidationTarget(dup.locations)
      console.log(`💡 Suggestion: Move to ${suggestedKey} and reference with @:${suggestedKey}`)
      console.log('')
    }

    if (exactDuplicates.length > 20) {
      console.log(`... and ${exactDuplicates.length - 20} more exact duplicates\n`)
    }
  }

  // Show parameterized duplicates
  if (parameterizedDuplicates.length > 0) {
    console.log('\n📌 PARAMETERIZED DUPLICATES')
    console.log('─'.repeat(80))
    console.log('These values contain parameters and can be consolidated:\n')

    for (const dup of parameterizedDuplicates.slice(0, 10)) {
      console.log(`Value: "${dup.value}"`)
      console.log(`Count: ${dup.count} occurrences`)
      console.log(`Locations:`)
      for (const loc of dup.locations) {
        console.log(`  - ${loc.fullKey}`)
      }

      const suggestedKey = findBestConsolidationTarget(dup.locations)
      console.log(`💡 Suggestion: Move to ${suggestedKey} and reference with @:${suggestedKey}`)
      console.log('')
    }

    if (parameterizedDuplicates.length > 10) {
      console.log(`... and ${parameterizedDuplicates.length - 10} more parameterized duplicates\n`)
    }
  }

  // Detect patterns
  console.log('\n🔍 PATTERN ANALYSIS')
  console.log('─'.repeat(80))
  detectPatterns(duplicates)

  // Generate summary
  console.log('\n📝 SUMMARY')
  console.log('═'.repeat(80))
  console.log(`Found ${duplicates.length} duplicate values across ${stats.totalKeys} keys.`)
  console.log(
    `Consolidating these could reduce translation keys by ${duplicates.reduce((sum, d) => sum + (d.count - 1), 0)}.`
  )
  console.log('')
  console.log('Next steps:')
  console.log('1. Review the duplicate values above')
  console.log('2. Identify which duplicates should be consolidated')
  console.log('3. Use the skill to propose and apply consolidation changes')
  console.log('')
}

/**
 * Finds the best target for consolidation
 */
function findBestConsolidationTarget(locations) {
  // Prefer shared namespace
  const sharedLoc = locations.find(l => l.fullKey.startsWith('shared.'))
  if (sharedLoc) return sharedLoc.fullKey

  // Prefer components namespace
  const componentLoc = locations.find(l => l.fullKey.startsWith('components.'))
  if (componentLoc) return componentLoc.fullKey

  // Otherwise use the first one
  return locations[0].fullKey
}

/**
 * Detects common patterns in duplicates
 */
function detectPatterns(duplicates) {
  const patterns = {
    'Back to': duplicates.filter(d => d.value.startsWith('Back to')),
    View: duplicates.filter(d => d.value.startsWith('View ')),
    All: duplicates.filter(d => d.value.startsWith('All ')),
    'Follow on': duplicates.filter(d => d.value.includes('Follow on')),
    Join: duplicates.filter(d => d.value.startsWith('Join ')),
    Watch: duplicates.filter(d => d.value.startsWith('Watch')),
  }

  for (const [pattern, matches] of Object.entries(patterns)) {
    if (matches.length > 0) {
      console.log(`\n"${pattern}" pattern: ${matches.length} duplicates`)
      for (const match of matches.slice(0, 3)) {
        console.log(`  - "${match.value}" (${match.count}x)`)
      }
    }
  }
}

// Run the analysis
analyzeDuplicates()
