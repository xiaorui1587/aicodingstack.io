#!/usr/bin/env node

/**
 * Sync all language files with en.json as source of truth
 *
 * This script:
 * 1. Reads messages/en.json as the reference
 * 2. Scans all other .json files in messages/
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
const MESSAGES_DIR = path.join(PROJECT_ROOT, 'messages')
const EN_FILE = path.join(MESSAGES_DIR, 'en.json')

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
 * Get value from nested object using dot notation
 * @param {Object} obj - The object to query
 * @param {string} path - Dot notation path (e.g., 'pages.home.title')
 * @returns {*} The value at the path
 */
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Set value in nested object using dot notation
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 */
function setValueByPath(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}

/**
 * Delete value from nested object using dot notation
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot notation path
 */
function deleteValueByPath(obj, path) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => current?.[key], obj)

  if (target && lastKey in target) {
    delete target[lastKey]

    // Clean up empty parent objects
    if (Object.keys(target).length === 0 && keys.length > 0) {
      deleteValueByPath(obj, keys.join('.'))
    }
  }
}

/**
 * Sync a target language file with the English reference
 * @param {string} targetFile - Path to the target language file
 * @param {Object} enData - English reference data
 * @returns {Object} Sync report
 */
function syncLanguageFile(targetFile, enData) {
  const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
  const enKeys = getAllKeys(enData)
  const targetKeys = getAllKeys(targetData)

  const added = []
  const removed = []

  // Add missing keys from en.json
  for (const key of enKeys) {
    if (!targetKeys.includes(key)) {
      const enValue = getValueByPath(enData, key)
      setValueByPath(targetData, key, enValue)
      added.push(key)
    }
  }

  // Remove extra keys not in en.json
  for (const key of targetKeys) {
    if (!enKeys.includes(key)) {
      deleteValueByPath(targetData, key)
      removed.push(key)
    }
  }

  // Write back with consistent formatting (2 spaces indentation)
  if (added.length > 0 || removed.length > 0) {
    fs.writeFileSync(targetFile, `${JSON.stringify(targetData, null, 2)}\n`, 'utf-8')
  }

  return { added, removed }
}

/**
 * Main sync function
 */
function main() {
  console.log(`${colors.cyan}🔄 Syncing language files with en.json...${colors.reset}\n`)

  // Check if messages directory exists
  if (!fs.existsSync(MESSAGES_DIR)) {
    console.error(`${colors.red}✗ Messages directory not found: ${MESSAGES_DIR}${colors.reset}`)
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
    .readdirSync(MESSAGES_DIR)
    .filter(file => file.endsWith('.json') && file !== 'en.json')
    .map(file => path.join(MESSAGES_DIR, file))

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
