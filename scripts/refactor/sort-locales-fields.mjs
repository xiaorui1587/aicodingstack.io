#!/usr/bin/env node

/**
 * Sort fields in all locales JSON files alphabetically
 * This script recursively processes all JSON files in the locales directory
 * and sorts their object keys alphabetically (including nested objects).
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')
const LOCALES_DIR = path.join(ROOT_DIR, 'locales')

/**
 * Recursively sort object keys alphabetically
 * Arrays are preserved as-is, only object keys are sorted
 */
function sortObjectKeysRecursively(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeysRecursively(item))
  }

  if (obj && typeof obj === 'object') {
    const sorted = {}
    const keys = Object.keys(obj).sort()

    for (const key of keys) {
      sorted[key] = sortObjectKeysRecursively(obj[key])
    }

    return sorted
  }

  return obj
}

/**
 * Process a single JSON file
 */
async function processJsonFile(filePath, relativePath) {
  try {
    // Read the file
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    // Sort the data recursively
    const sortedData = sortObjectKeysRecursively(data)

    // Write back to file with 2-space indentation
    const jsonContent = `${JSON.stringify(sortedData, null, 2)}\n`
    await fs.writeFile(filePath, jsonContent, 'utf-8')

    console.log(`  ✅ ${relativePath}`)
  } catch (error) {
    console.error(`  ❌ Error processing ${relativePath}:`, error.message)
  }
}

/**
 * Recursively find all JSON files in a directory
 */
async function findJsonFiles(dirPath, basePath = dirPath) {
  const jsonFiles = []

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findJsonFiles(fullPath, basePath)
        jsonFiles.push(...subFiles)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // Calculate relative path from base
        const relativePath = path.relative(basePath, fullPath)
        jsonFiles.push({ fullPath, relativePath })
      }
    }
  } catch (error) {
    console.error(`  ⚠️  Error reading directory ${dirPath}:`, error.message)
  }

  return jsonFiles
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Sorting locales JSON files alphabetically...\n')

  // Find all JSON files in locales directory
  const jsonFiles = await findJsonFiles(LOCALES_DIR)

  if (jsonFiles.length === 0) {
    console.log('⚠️  No JSON files found in locales directory')
    return
  }

  console.log(`📁 Found ${jsonFiles.length} JSON file(s) to process\n`)

  // Process each file
  for (const { fullPath, relativePath } of jsonFiles) {
    await processJsonFile(fullPath, relativePath)
  }

  console.log('\n✨ Done!')
}

main().catch(console.error)
