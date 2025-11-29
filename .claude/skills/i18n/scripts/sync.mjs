#!/usr/bin/env node

/**
 * Sync all language files with en.json as source of truth
 *
 * This script:
 * 1. Reads locales/en.json as the reference
 * 2. Scans all other .json files in locales/
 * 3. Adds missing keys (with English text as placeholder)
 * 4. Removes extra keys not present in en.json
 * 5. Preserves JSON structure and formatting
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

// Get project root (4 levels up from .claude/skills/i18n/scripts/)
const PROJECT_ROOT = path.resolve(__dirname, '../../../../')
const LOCALES_DIR = path.join(PROJECT_ROOT, 'locales')
const EN_FILE = path.join(LOCALES_DIR, 'en.json')

/**
 * Recursively get all keys from a nested object
 * @param {Object} obj - The object to traverse
 * @param {string} prefix - Current key path prefix
 * @returns {string[]} Array of dot-notation key paths
 */
function getAllKeys(obj, prefix = '') {
  const keys = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys
}

/**
 * Recursively rebuild object with same structure and order as reference
 * @param {Object} reference - The reference object (en.json)
 * @param {Object} target - The target object to sync
 * @param {Array} added - Array to track added keys
 * @param {Array} removed - Array to track removed keys
 * @param {string} prefix - Current key path prefix
 * @returns {Object} Rebuilt object with same structure as reference
 */
function rebuildWithSameOrder(reference, target, added, removed, prefix = '') {
  const result = {}

  // Iterate through reference keys in order
  for (const [key, refValue] of Object.entries(reference)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (refValue !== null && typeof refValue === 'object' && !Array.isArray(refValue)) {
      // It's a nested object
      if (
        key in target &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        // Recursively rebuild nested object
        result[key] = rebuildWithSameOrder(refValue, target[key], added, removed, fullKey)
      } else {
        // Missing nested object, use reference structure
        result[key] = rebuildWithSameOrder(refValue, {}, added, removed, fullKey)
        // Track all leaf keys as added
        const leafKeys = getAllKeys(refValue, fullKey)
        added.push(...leafKeys)
      }
    } else {
      // It's a leaf value
      if (key in target) {
        // Use target's translation
        result[key] = target[key]
      } else {
        // Missing key, use English as placeholder
        result[key] = refValue
        added.push(fullKey)
      }
    }
  }

  // Track removed keys (keys in target but not in reference)
  for (const key in target) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (!(key in reference)) {
      if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
        const leafKeys = getAllKeys(target[key], fullKey)
        removed.push(...leafKeys)
      } else {
        removed.push(fullKey)
      }
    }
  }

  return result
}

/**
 * Sync a target language file with the English reference
 * @param {string} targetFile - Path to the target language file
 * @param {Object} enData - English reference data
 * @returns {Object} Sync report
 */
function syncLanguageFile(targetFile, enData) {
  const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'))

  const added = []
  const removed = []

  // Rebuild target with same structure and order as en.json
  const syncedData = rebuildWithSameOrder(enData, targetData, added, removed)

  // Always write to ensure correct order
  fs.writeFileSync(targetFile, `${JSON.stringify(syncedData, null, 2)}\n`, 'utf-8')

  return { added, removed }
}

/**
 * Main sync function
 */
function main() {
  console.log(`${colors.cyan}🔄 Syncing language files with en.json...${colors.reset}\n`)

  // Check if locales directory exists
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`${colors.red}✗ Locales directory not found: ${LOCALES_DIR}${colors.reset}`)
    process.exit(1)
  }

  // Read English reference file
  if (!fs.existsSync(EN_FILE)) {
    console.error(`${colors.red}✗ English reference file not found: ${EN_FILE}${colors.reset}`)
    process.exit(1)
  }

  const enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'))

  // Get all language files except en.json
  const files = fs
    .readdirSync(LOCALES_DIR)
    .filter(file => file.endsWith('.json') && file !== 'en.json')
    .map(file => path.join(LOCALES_DIR, file))

  if (files.length === 0) {
    console.log(`${colors.yellow}⚠ No other language files found to sync${colors.reset}`)
    return
  }

  let totalAdded = 0
  let totalRemoved = 0
  let filesModified = 0

  // Sync each language file
  for (const file of files) {
    const locale = path.basename(file, '.json')
    const { added, removed } = syncLanguageFile(file, enData)

    if (added.length > 0 || removed.length > 0) {
      filesModified++
      console.log(
        `${colors.green}✓${colors.reset} Synced ${colors.blue}${locale}.json${colors.reset}`
      )

      if (added.length > 0) {
        console.log(
          `  ${colors.green}+${colors.reset} Added ${added.length} key${added.length > 1 ? 's' : ''}`
        )
        totalAdded += added.length
      }

      if (removed.length > 0) {
        console.log(
          `  ${colors.red}-${colors.reset} Removed ${removed.length} key${removed.length > 1 ? 's' : ''}`
        )
        totalRemoved += removed.length
      }

      console.log('')
    } else {
      console.log(
        `${colors.green}✓${colors.reset} ${colors.blue}${locale}.json${colors.reset} already in sync`
      )
    }
  }

  // Summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)

  if (filesModified > 0) {
    console.log(`${colors.green}✓ Sync complete!${colors.reset}`)
    console.log(`  Modified: ${filesModified} file${filesModified > 1 ? 's' : ''}`)
    console.log(`  Added: ${totalAdded} key${totalAdded > 1 ? 's' : ''}`)
    console.log(`  Removed: ${totalRemoved} key${totalRemoved > 1 ? 's' : ''}`)
  } else {
    console.log(`${colors.green}✓ All language files are already in sync${colors.reset}`)
  }
}

// Run the script
try {
  main()
} catch (error) {
  console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`)
  process.exit(1)
}
