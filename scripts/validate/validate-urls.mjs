#!/usr/bin/env node

/**
 * Validates all URLs in manifest JSON files
 * Uses concurrent HTTP requests to check URL accessibility
 * Utilizes random realistic user agents to improve request success rate
 * This script runs before build to ensure all links are valid
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import UserAgent from 'user-agents'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')

// Configuration
const MAX_CONCURRENT_REQUESTS = 10
const REQUEST_TIMEOUT = 10000 // 10 seconds
const RETRY_COUNT = 3
const VALIDATED_URLS_LOG = path.join(__dirname, '../validated-urls.log')

// Domain prefixes to skip validation (e.g., ['https://example.com', 'http://localhost'])
const SKIP_DOMAIN_PREFIXES = [
  'https://huggingface.co',
  'https://discord.com/invite/',
  'https://discord.gg/',
  'https://www.npmjs.com/package/',
  'https://www.reddit.com/r/',
  'https://www.youtube.com/',
]

// Manifest directories to validate (each contains multiple JSON files)
const MANIFEST_DIRS = ['clis', 'ides', 'extensions', 'providers', 'models', 'vendors']

// Single manifest file (not in a directory)
const COLLECTIONS_FILE = 'collections.json'

/**
 * Save validation results to log file
 */
function saveValidationLog(results) {
  try {
    const validated = []
    const skipped = []
    const failed = []
    const notFound = []

    // Categorize results
    results.forEach(result => {
      if (result.skipped) {
        skipped.push(result.url)
      } else if (result.valid) {
        validated.push(result.url)
      } else if (result.status === 404) {
        notFound.push(result.url)
      } else {
        failed.push({ url: result.url, error: result.error || 'Unknown error' })
      }
    })

    // Build file content
    const lines = []

    // Successfully Validated section
    lines.push('// Successfully Validated')
    if (validated.length > 0) {
      for (const url of validated.sort()) {
        lines.push(url)
      }
    }
    lines.push('')

    // Skipped section
    if (skipped.length > 0) {
      lines.push('// Skipped (domain prefix in skip list)')
      for (const url of skipped.sort()) {
        lines.push(url)
      }
      lines.push('')
    }

    // Validation Failed section
    lines.push('// Validation Failed')
    if (failed.length > 0) {
      failed
        .sort((a, b) => a.url.localeCompare(b.url))
        .forEach(({ url, error }) => {
          lines.push(`${url}  // ${error}`)
        })
    }
    lines.push('')

    // 404 Not Found section
    lines.push('// 404 Not Found')
    if (notFound.length > 0) {
      for (const url of notFound.sort()) {
        lines.push(url)
      }
    }

    // Write to file
    fs.writeFileSync(VALIDATED_URLS_LOG, `${lines.join('\n')}\n`, 'utf8')
  } catch (error) {
    console.error(`❌ Failed to save validation log: ${error.message}`)
  }
}

/**
 * Extract a URL field value if it exists and is a non-null string
 */
function extractUrlField(item, field, manifestFile, itemId, fieldPath) {
  const value = item[field]
  if (value && value !== null && typeof value === 'string') {
    return {
      url: value,
      source: `${manifestFile} → ${itemId} → ${fieldPath || field}`,
      itemId,
      field: fieldPath || field,
    }
  }
  return null
}

/**
 * Extract URLs from nested object (resourceUrls, communityUrls, platformUrls)
 */
function extractNestedUrls(item, nestedField, manifestFile, itemId) {
  const urls = []
  const nestedObj = item[nestedField]
  if (nestedObj && typeof nestedObj === 'object') {
    Object.entries(nestedObj).forEach(([key, value]) => {
      if (value && value !== null && typeof value === 'string') {
        urls.push({
          url: value,
          source: `${manifestFile} → ${itemId} → ${nestedField}.${key}`,
          itemId,
          field: `${nestedField}.${key}`,
        })
      }
    })
  }
  return urls
}

/**
 * Extract all URLs from a manifest item based on schema definitions
 */
function extractUrls(item, manifestFile) {
  const urls = []
  const itemId = item.id || item.name || 'unknown'

  // Determine manifest type from file path
  // manifestFile format: "clis/codex-cli.json" or "collections.json"
  const manifestType = manifestFile.includes('/')
    ? manifestFile.split('/')[0] // Extract directory name (e.g., "clis" from "clis/codex-cli.json")
    : manifestFile.replace('.json', '') // For single files like "collections.json"

  // Common fields from entity.schema.json (all entities have these)
  // websiteUrl and docsUrl are required in entity schema
  const websiteUrl = extractUrlField(item, 'websiteUrl', manifestFile, itemId)
  if (websiteUrl) urls.push(websiteUrl)

  const docsUrl = extractUrlField(item, 'docsUrl', manifestFile, itemId)
  if (docsUrl) urls.push(docsUrl)

  // Fields from product.schema.json (clis, ides, extensions)
  if (['clis', 'ides', 'extensions'].includes(manifestType)) {
    // githubUrl from product schema
    const githubUrl = extractUrlField(item, 'githubUrl', manifestFile, itemId)
    if (githubUrl) urls.push(githubUrl)

    // resourceUrls from product schema
    urls.push(...extractNestedUrls(item, 'resourceUrls', manifestFile, itemId))

    // communityUrls from product schema
    urls.push(...extractNestedUrls(item, 'communityUrls', manifestFile, itemId))
  }

  // Fields specific to extensions.schema.json
  if (manifestType === 'extensions') {
    // supportedIdes array with marketplaceUrl
    if (item.supportedIdes && Array.isArray(item.supportedIdes)) {
      item.supportedIdes.forEach((ideSupport, index) => {
        if (ideSupport.marketplaceUrl) {
          urls.push({
            url: ideSupport.marketplaceUrl,
            source: `${manifestFile} → ${itemId} → supportedIdes[${index}].marketplaceUrl`,
            itemId,
            field: `supportedIdes[${index}].marketplaceUrl`,
          })
        }
      })
    }
  }

  // Fields from providers.schema.json
  if (manifestType === 'providers') {
    // applyKeyUrl from providers schema
    const applyKeyUrl = extractUrlField(item, 'applyKeyUrl', manifestFile, itemId)
    if (applyKeyUrl) urls.push(applyKeyUrl)

    // platformUrls from providers schema
    urls.push(...extractNestedUrls(item, 'platformUrls', manifestFile, itemId))

    // communityUrls from providers schema
    urls.push(...extractNestedUrls(item, 'communityUrls', manifestFile, itemId))
  }

  // Fields from models.schema.json
  if (manifestType === 'models') {
    // platformUrls from models schema
    urls.push(...extractNestedUrls(item, 'platformUrls', manifestFile, itemId))
  }

  // Fields from vendors.schema.json
  if (manifestType === 'vendors') {
    // communityUrls from vendors schema
    urls.push(...extractNestedUrls(item, 'communityUrls', manifestFile, itemId))
  }

  // Note: collections.json is handled separately in loadAllUrls function
  // because it has a different nested structure

  return urls
}

/**
 * Load all URLs from manifest files
 */
function loadAllUrls() {
  const allUrls = []
  const manifestsDir = path.join(rootDir, 'manifests')

  // Process manifest directories (clis, ides, extensions, etc.)
  for (const manifestDir of MANIFEST_DIRS) {
    const manifestDirPath = path.join(manifestsDir, manifestDir)

    if (!fs.existsSync(manifestDirPath)) {
      console.warn(`⚠️  Manifest directory not found: ${manifestDir}`)
      continue
    }

    try {
      // Read all JSON files in the directory
      const files = fs.readdirSync(manifestDirPath)
      const jsonFiles = files.filter(file => file.endsWith('.json'))

      if (jsonFiles.length === 0) {
        console.warn(`⚠️  No JSON files found in ${manifestDir}`)
        continue
      }

      for (const jsonFile of jsonFiles) {
        const manifestPath = path.join(manifestDirPath, jsonFile)
        const manifestFile = `${manifestDir}/${jsonFile}` // Use dir/file.json format for extractUrls

        try {
          const content = fs.readFileSync(manifestPath, 'utf8')
          const data = JSON.parse(content)

          // Each file should contain a single item object
          if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            const urls = extractUrls(data, manifestFile)
            allUrls.push(...urls)
          } else {
            console.warn(`⚠️  ${manifestFile} is not an object, skipping`)
          }
        } catch (error) {
          console.error(`❌ Error reading ${manifestFile}: ${error.message}`)
        }
      }
    } catch (error) {
      console.error(`❌ Error reading directory ${manifestDir}: ${error.message}`)
    }
  }

  // Handle collections.json special structure
  const collectionsPath = path.join(manifestsDir, COLLECTIONS_FILE)
  if (fs.existsSync(collectionsPath)) {
    try {
      const content = fs.readFileSync(collectionsPath, 'utf8')
      const data = JSON.parse(content)

      if (typeof data === 'object' && data !== null) {
        // Process each section (specifications, articles, tools)
        Object.entries(data).forEach(([sectionName, section]) => {
          if (section?.cards && Array.isArray(section.cards)) {
            section.cards.forEach(card => {
              if (card?.items && Array.isArray(card.items)) {
                card.items.forEach(item => {
                  // Collections items only have 'url' field according to schema
                  if (item.url && typeof item.url === 'string') {
                    const itemId = item.name || 'unknown'
                    allUrls.push({
                      url: item.url,
                      source: `${COLLECTIONS_FILE} → ${sectionName} → ${card.title} → ${itemId} → url`,
                      itemId,
                      field: 'url',
                    })
                  }
                })
              }
            })
          }
        })
      }
    } catch (error) {
      console.error(`❌ Error reading ${COLLECTIONS_FILE}: ${error.message}`)
    }
  } else {
    console.warn(`⚠️  Manifest file not found: ${COLLECTIONS_FILE}`)
  }

  return allUrls
}

/**
 * Check if a URL should be skipped based on domain prefix
 */
function shouldSkipUrl(url) {
  if (SKIP_DOMAIN_PREFIXES.length === 0) {
    return false
  }
  return SKIP_DOMAIN_PREFIXES.some(prefix => url.startsWith(prefix))
}

/**
 * Check if a URL is accessible
 */
async function checkUrl(urlInfo, retries = RETRY_COUNT) {
  const { url } = urlInfo

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Generate a random realistic user agent for each request
      const userAgent = new UserAgent()
      const userAgentString = userAgent.toString()

      // Some domains (deepseek.com, huggingface.co) don't respond well to HEAD requests
      // Use GET directly for these domains
      const useGetOnly = url.includes('deepseek.com') || url.includes('huggingface.co')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(url, {
        method: useGetOnly ? 'GET' : 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': userAgentString,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      })

      clearTimeout(timeoutId)

      // Accept 2xx and 3xx status codes
      if (response.ok || (response.status >= 300 && response.status < 400)) {
        return { ...urlInfo, valid: true, status: response.status }
      }

      // If we already used GET, handle the error status
      if (useGetOnly) {
        // If GET returns 404, don't retry - resource truly doesn't exist
        if (response.status === 404) {
          return {
            ...urlInfo,
            valid: false,
            status: response.status,
            error: `HTTP ${response.status}`,
          }
        }

        // Retry on other error status codes (e.g., 403, 500, 502, 503, 429)
        if (attempt < retries) {
          const delay = 2 ** attempt * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        return {
          ...urlInfo,
          valid: false,
          status: response.status,
          error: `HTTP ${response.status}`,
        }
      }

      // HEAD request failed, try GET request (servers may have different behavior for HEAD vs GET)
      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), REQUEST_TIMEOUT)

      const getResponse = await fetch(url, {
        method: 'GET',
        signal: controller2.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': userAgentString,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      })

      clearTimeout(timeoutId2)

      // Accept 2xx and 3xx status codes from GET
      if (getResponse.ok || (getResponse.status >= 300 && getResponse.status < 400)) {
        return { ...urlInfo, valid: true, status: getResponse.status }
      }

      // If GET returns 404, don't retry - resource truly doesn't exist
      if (getResponse.status === 404) {
        return {
          ...urlInfo,
          valid: false,
          status: getResponse.status,
          error: `HTTP ${getResponse.status} (tried both HEAD and GET)`,
        }
      }

      // Retry on other error status codes (e.g., 403, 500, 502, 503, 429)
      if (attempt < retries) {
        const delay = 2 ** attempt * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return {
        ...urlInfo,
        valid: false,
        status: getResponse.status,
        error: `HTTP ${getResponse.status} (tried both HEAD and GET)`,
      }
    } catch (error) {
      if (attempt < retries) {
        // Retry on network errors with exponential backoff: 1s, 2s, 4s
        const delay = 2 ** attempt * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      let errorMessage = error.message
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout'
      } else if (error.cause?.code) {
        errorMessage = error.cause.code
      }

      return {
        ...urlInfo,
        valid: false,
        error: errorMessage,
      }
    }
  }
}

/**
 * Process URLs with concurrency control
 * Uses a pool-based approach where completed requests are immediately replaced
 * This prevents slow URLs from blocking the entire batch
 */
async function validateUrls(urls) {
  const results = []
  const total = urls.length
  let completed = 0
  let valid = 0
  let invalid = 0
  let skipped = 0
  let currentIndex = 0

  console.log(
    `\n🔗 Checking ${total} URLs with up to ${MAX_CONCURRENT_REQUESTS} concurrent requests...\n`
  )

  return new Promise(resolve => {
    let activeRequests = 0

    const processNext = () => {
      // Check if we're done
      if (completed === total) {
        resolve({ results, total, valid, invalid, skipped })
        return
      }

      // Start new requests up to the concurrency limit
      while (activeRequests < MAX_CONCURRENT_REQUESTS && currentIndex < total) {
        const urlInfo = urls[currentIndex++]
        activeRequests++

        // Check if URL should be skipped
        if (shouldSkipUrl(urlInfo.url)) {
          results.push({
            ...urlInfo,
            valid: true,
            status: 'skipped',
            skipped: true,
          })
          completed++
          activeRequests--
          skipped++
          valid++
          process.stdout.write(`⏭️  [${completed}/${total}] ${urlInfo.url} (skipped)\n`)
          processNext()
          continue
        }

        // Process URL and handle completion
        checkUrl(urlInfo)
          .then(result => {
            results.push(result)
            completed++
            activeRequests--

            if (result.valid) {
              valid++
              process.stdout.write(`✅ [${completed}/${total}] ${result.url}\n`)
            } else {
              invalid++
              process.stdout.write(`❌ [${completed}/${total}] ${result.url} (${result.error})\n`)
            }

            // Process next URL immediately after this one completes
            processNext()
          })
          .catch(error => {
            // Handle unexpected errors
            results.push({
              ...urlInfo,
              valid: false,
              error: error.message || 'Unexpected error',
            })
            completed++
            activeRequests--
            invalid++
            process.stdout.write(`❌ [${completed}/${total}] ${urlInfo.url} (${error.message})\n`)

            // Process next URL even after error
            processNext()
          })
      }
    }

    // Start initial batch
    processNext()
  })
}

/**
 * Validate URL format (e.g., check for trailing slashes)
 * Returns array of validation errors
 */
function validateUrlFormat(urls) {
  const errors = []

  urls.forEach(urlInfo => {
    const { url } = urlInfo

    // Check if URL ends with a trailing slash
    if (url.endsWith('/')) {
      errors.push({
        ...urlInfo,
        valid: false,
        error: 'URL ends with trailing slash (/)',
        formatError: true,
      })
    }
  })

  return errors
}

/**
 * Format validation results
 */
function formatResults(results) {
  const invalidUrls = results.filter(r => !r.valid)

  if (invalidUrls.length === 0) {
    return
  }

  console.error('\n\n❌ Invalid URLs found:\n')

  // Group by manifest file
  const byManifest = {}
  invalidUrls.forEach(urlInfo => {
    const manifestFile = urlInfo.source.split(' → ')[0]
    if (!byManifest[manifestFile]) {
      byManifest[manifestFile] = []
    }
    byManifest[manifestFile].push(urlInfo)
  })

  Object.entries(byManifest).forEach(([manifestFile, urls]) => {
    console.error(`\n📄 ${manifestFile}:`)
    urls.forEach(urlInfo => {
      console.error(`   • ${urlInfo.url}`)
      console.error(`     Location: ${urlInfo.itemId} → ${urlInfo.field}`)
      console.error(`     Error: ${urlInfo.error}`)
      if (urlInfo.status) {
        console.error(`     Status: ${urlInfo.status}`)
      }
    })
  })

  // Group by error type for easy copying
  console.error('\n\n📋 URLs grouped by error type (for easy copying):\n')

  const byErrorType = {}
  invalidUrls.forEach(urlInfo => {
    let errorType = 'Unknown Error'

    if (urlInfo.status) {
      errorType = `HTTP ${urlInfo.status}`
    } else if (urlInfo.error) {
      if (urlInfo.error.includes('timeout')) {
        errorType = 'Timeout'
      } else if (urlInfo.error.includes('ENOTFOUND') || urlInfo.error.includes('DNS')) {
        errorType = 'DNS Resolution Failed'
      } else if (urlInfo.error.includes('ECONNREFUSED')) {
        errorType = 'Connection Refused'
      } else if (urlInfo.error.includes('ECONNRESET')) {
        errorType = 'Connection Reset'
      } else if (urlInfo.error.includes('ETIMEDOUT')) {
        errorType = 'Connection Timeout'
      } else {
        errorType = 'Network Error'
      }
    }

    if (!byErrorType[errorType]) {
      byErrorType[errorType] = []
    }
    byErrorType[errorType].push(urlInfo)
  })

  Object.entries(byErrorType).forEach(([errorType, urls]) => {
    console.error(`\n🔸 ${errorType} (${urls.length} URLs):`)
    console.error('```')
    urls.forEach(urlInfo => {
      console.error(urlInfo.url)
    })
    console.error('```')
  })
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Validating URLs in manifest files...')

  const urls = loadAllUrls()

  if (urls.length === 0) {
    console.warn('\n⚠️  No URLs found to validate')
    return
  }

  // Remove duplicates
  const uniqueUrls = Array.from(new Map(urls.map(u => [u.url, u])).values())

  console.log(`📊 Found ${urls.length} URL references (${uniqueUrls.length} unique)`)

  // Validate URL format first (e.g., check for trailing slashes)
  const formatErrors = validateUrlFormat(uniqueUrls)
  if (formatErrors.length > 0) {
    console.error('\n❌ URL format validation failed:\n')
    formatErrors.forEach(error => {
      console.error(`   • ${error.url}`)
      console.error(`     Location: ${error.itemId} → ${error.field}`)
      console.error(`     Error: ${error.error}`)
    })
    console.error('\n❌ URL validation failed! Please fix the format errors above.')
    process.exit(1)
  }

  // Validate all URLs
  const { results, total, valid, invalid, skipped } = await validateUrls(uniqueUrls)

  // Save results to log file
  saveValidationLog(results)
  console.log(`\n💾 Saved validation results to: ${VALIDATED_URLS_LOG}`)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`\n📊 Summary:`)
  console.log(`   Total URLs: ${total}`)
  console.log(`   Valid: ${valid} ✅`)
  if (skipped > 0) {
    console.log(`   Skipped: ${skipped} ⏭️`)
  }
  console.log(`   Invalid: ${invalid} ❌`)
  const validatedCount = total - skipped
  if (validatedCount > 0) {
    console.log(`   Success rate: ${((valid / validatedCount) * 100).toFixed(1)}%`)
  }

  formatResults(results)

  if (invalid > 0) {
    console.error('\n❌ URL validation failed! Please fix the invalid URLs above.')
    process.exit(1)
  } else {
    console.log('\n✅ All URLs are valid!')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
