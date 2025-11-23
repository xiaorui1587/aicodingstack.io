#!/usr/bin/env node

/**
 * Validates that github-stars.json entries match existing manifest files
 *
 * This script ensures:
 * 1. All entries in github-stars.json have corresponding manifest files
 * 2. All manifest files are present in github-stars.json (optional check)
 * 3. No orphaned entries exist in either direction
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')

// Categories to validate
const CATEGORIES = ['extensions', 'clis', 'ides']

/**
 * Get all manifest IDs from a directory
 */
function getManifestIds(category) {
  const dirPath = path.join(rootDir, 'manifests', category)

  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Manifest directory not found: ${category}/`)
    return []
  }

  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'))
  return files.map(file => path.basename(file, '.json'))
}

/**
 * Get all IDs from github-stars.json for a category
 */
function getGithubStarIds(githubStarsData, category) {
  if (!githubStarsData[category]) {
    return []
  }
  return Object.keys(githubStarsData[category])
}

/**
 * Load github-stars.json
 */
function loadGithubStars() {
  const githubStarsPath = path.join(rootDir, 'data', 'github-stars.json')

  if (!fs.existsSync(githubStarsPath)) {
    console.error('❌ github-stars.json not found at data/github-stars.json')
    process.exit(1)
  }

  const content = fs.readFileSync(githubStarsPath, 'utf8')
  try {
    return JSON.parse(content)
  } catch (error) {
    console.error(`❌ Failed to parse github-stars.json: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating github-stars.json against manifest files...\n')

  const githubStarsData = loadGithubStars()
  let hasErrors = false
  let totalChecked = 0

  // Validate each category
  for (const category of CATEGORIES) {
    console.log(`\n📂 Checking category: ${category}`)

    const manifestIds = getManifestIds(category)
    const githubStarIds = getGithubStarIds(githubStarsData, category)

    console.log(`   Manifests: ${manifestIds.length} files`)
    console.log(`   GitHub Stars: ${githubStarIds.length} entries`)

    // Check for entries in github-stars.json without corresponding manifests
    const orphanedGithubStars = githubStarIds.filter(id => !manifestIds.includes(id))
    if (orphanedGithubStars.length > 0) {
      console.error(`\n   ❌ Entries in github-stars.json without manifest files:`)
      for (const id of orphanedGithubStars) {
        console.error(`      • ${id}`)
      }
      hasErrors = true
    }

    // Check for manifest files without entries in github-stars.json
    const missingGithubStars = manifestIds.filter(id => !githubStarIds.includes(id))
    if (missingGithubStars.length > 0) {
      console.error(`\n   ❌ Manifest files without github-stars.json entries:`)
      for (const id of missingGithubStars) {
        console.error(`      • ${id}`)
      }
      hasErrors = true
    }

    if (orphanedGithubStars.length === 0 && missingGithubStars.length === 0) {
      console.log(`   ✅ All entries match (${manifestIds.length} items)`)
    }

    totalChecked++
  }

  // Summary
  console.log(`\n📊 Summary: ${totalChecked} categories checked`)

  if (hasErrors) {
    console.error('\n❌ Validation failed! Please fix the mismatches above.')
    console.error('\nTo fix:')
    console.error('  • Remove orphaned entries from data/github-stars.json')
    console.error(
      '  • Add missing entries to data/github-stars.json (set value to null if unknown)'
    )
    console.error('  • Or remove unused manifest files if they are not needed')
    process.exit(1)
  } else {
    console.log('\n✅ All github-stars.json entries match manifest files!')
  }
}

main()
