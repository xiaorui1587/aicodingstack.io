#!/usr/bin/env node

/**
 * Export vendors from manifest files
 * This script extracts vendor information from ide/cli/extension/model/provider
 * manifest files and creates vendor files if they don't exist.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')
const MANIFESTS_DIR = path.join(ROOT_DIR, 'manifests')
const VENDORS_DIR = path.join(MANIFESTS_DIR, 'vendors')

/**
 * Convert vendor name to vendor id
 * Rules: lowercase, replace spaces and dots with hyphens
 * @param {string} vendorName - The vendor name
 * @returns {string} The vendor id
 */
function vendorNameToId(vendorName) {
  return vendorName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\./g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Load and parse a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} Parsed JSON object
 */
async function loadJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Get all JSON files in a directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<string[]>} Array of JSON file paths
 */
async function getJsonFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const jsonFiles = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        jsonFiles.push(path.join(dirPath, entry.name))
      }
    }

    return jsonFiles.sort()
  } catch {
    return []
  }
}

/**
 * Merge community URLs objects
 * Priority: existing value > new value (if existing is null/undefined, use new)
 * @param {Object|null} existing - Existing communityUrls object
 * @param {Object|null} newUrls - New communityUrls object
 * @returns {Object} Merged communityUrls object
 */
function mergeCommunityUrls(existing, newUrls) {
  const result = {
    linkedin: null,
    twitter: null,
    github: null,
    youtube: null,
    discord: null,
    reddit: null,
    blog: null,
  }

  // Start with existing values
  if (existing) {
    Object.keys(result).forEach(key => {
      result[key] = existing[key] || null
    })
  }

  // Override with new values if existing is null
  if (newUrls) {
    Object.keys(result).forEach(key => {
      if (!result[key] && newUrls[key]) {
        result[key] = newUrls[key]
      }
    })
  }

  return result
}

/**
 * Merge vendor information from multiple manifests
 * Priority: existing value > new value (if existing is null/undefined, use new)
 * @param {Object} existing - Existing vendor data
 * @param {Object} newData - New vendor data from manifest
 * @returns {Object} Merged vendor data
 */
function mergeVendorData(existing, newData) {
  const merged = { ...existing }

  // Merge basic fields
  if (!merged.websiteUrl && newData.websiteUrl) {
    merged.websiteUrl = newData.websiteUrl
  }

  if (!merged.docsUrl && newData.docsUrl) {
    merged.docsUrl = newData.docsUrl
  }

  if (merged.verified === undefined && newData.verified !== undefined) {
    merged.verified = newData.verified
  }

  // Merge communityUrls
  merged.communityUrls = mergeCommunityUrls(merged.communityUrls, newData.communityUrls)

  // Merge i18n if both exist
  if (newData.i18n) {
    if (!merged.i18n) {
      merged.i18n = {}
    }
    // Merge i18n descriptions for each locale
    Object.keys(newData.i18n).forEach(locale => {
      if (!merged.i18n[locale]) {
        merged.i18n[locale] = {}
      }
      if (!merged.i18n[locale].description && newData.i18n[locale]?.description) {
        merged.i18n[locale].description = newData.i18n[locale].description
      }
    })
  }

  return merged
}

/**
 * Extract vendor information from a manifest file
 * @param {Object} manifest - The manifest object
 * @returns {Object|null} Extracted vendor data or null if no vendor field
 */
function extractVendorData(manifest) {
  if (!manifest.vendor) {
    return null
  }

  const vendorData = {
    name: manifest.vendor,
    websiteUrl: manifest.websiteUrl || null,
    docsUrl: manifest.docsUrl || null,
    verified: manifest.verified !== undefined ? manifest.verified : false,
    communityUrls: manifest.communityUrls || null,
    i18n: manifest.i18n || null,
  }

  return vendorData
}

/**
 * Create a vendor file from vendor data
 * @param {string} vendorId - The vendor id
 * @param {Object} vendorData - The vendor data
 * @returns {Object} Complete vendor object
 */
function createVendorObject(vendorId, vendorData) {
  // Default description if not provided
  const defaultDescription = `${vendorData.name} is a vendor.`

  const vendor = {
    id: vendorId,
    name: vendorData.name,
    description: vendorData.description || defaultDescription,
    i18n: vendorData.i18n || {},
    websiteUrl: vendorData.websiteUrl || null,
    docsUrl: vendorData.docsUrl || null,
    verified: vendorData.verified !== undefined ? vendorData.verified : false,
    communityUrls: mergeCommunityUrls(null, vendorData.communityUrls),
  }

  return vendor
}

/**
 * Process a single manifest file and extract vendor information
 * @param {string} manifestPath - Path to the manifest file
 * @param {Map<string, Object>} vendorsMap - Map of vendor id to vendor data
 * @returns {Promise<void>}
 */
async function processManifest(manifestPath, vendorsMap) {
  try {
    const manifest = await loadJSON(manifestPath)
    const vendorData = extractVendorData(manifest)

    if (!vendorData) {
      return
    }

    const vendorId = vendorNameToId(vendorData.name)

    // If vendor already exists in map, merge the data
    if (vendorsMap.has(vendorId)) {
      const existing = vendorsMap.get(vendorId)
      vendorsMap.set(vendorId, mergeVendorData(existing, vendorData))
    } else {
      vendorsMap.set(vendorId, vendorData)
    }
  } catch (error) {
    console.error(`  ⚠️  Error processing ${manifestPath}:`, error.message)
  }
}

/**
 * Process all manifest files in a directory
 * @param {string} categoryDir - Directory path
 * @param {Map<string, Object>} vendorsMap - Map of vendor id to vendor data
 * @returns {Promise<void>}
 */
async function processCategory(categoryDir, vendorsMap) {
  const jsonFiles = await getJsonFiles(categoryDir)

  if (jsonFiles.length === 0) {
    return
  }

  for (const jsonFile of jsonFiles) {
    await processManifest(jsonFile, vendorsMap)
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Exporting vendors from manifest files...\n')

  // Categories to process
  const categories = ['ides', 'clis', 'extensions', 'models', 'providers']

  // Map to store vendor data (vendorId -> vendorData)
  const vendorsMap = new Map()

  // Process all categories
  for (const category of categories) {
    const categoryDir = path.join(MANIFESTS_DIR, category)
    console.log(`📁 Processing ${category}/...`)

    await processCategory(categoryDir, vendorsMap)
  }

  console.log(`\n📊 Found ${vendorsMap.size} unique vendors\n`)

  // Create vendor files
  let createdCount = 0
  let skippedCount = 0

  for (const [vendorId, vendorData] of vendorsMap) {
    const vendorFilePath = path.join(VENDORS_DIR, `${vendorId}.json`)

    // Check if vendor file already exists
    if (await fileExists(vendorFilePath)) {
      console.log(`⏭️  Skipping ${vendorId} (already exists)`)
      skippedCount++
      continue
    }

    // Create vendor object
    const vendor = createVendorObject(vendorId, vendorData)

    // Write vendor file
    const jsonContent = `${JSON.stringify(vendor, null, 2)}\n`
    await fs.writeFile(vendorFilePath, jsonContent, 'utf-8')

    console.log(`✅ Created ${vendorId}.json`)
    createdCount++
  }

  console.log(`\n✨ Done!`)
  console.log(`   Created: ${createdCount} vendors`)
  console.log(`   Skipped: ${skippedCount} vendors`)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
