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

// Manifest files to validate
const MANIFEST_FILES = [
  'clis.json',
  'ides.json',
  'extensions.json',
  'providers.json',
  'models.json',
  'collections.json',
  'vendors.json',
]

// URL field patterns to extract from different manifest types
const URL_FIELDS = [
  'websiteUrl',
  'docsUrl',
  'applyKeyUrl',
  'website',
  'docs',
  'marketplaceUrl',
  'url',
]

/**
 * Save validation results to log file
 */
function saveValidationLog(results) {
  try {
    const validated = []
    const failed = []
    const notFound = []

    // Categorize results
    results.forEach(result => {
      if (result.valid) {
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
 * Extract all URLs from a manifest item
 */
function extractUrls(item, manifestFile) {
  const urls = []
  const itemId = item.id || item.name || 'unknown'

  // Direct URL fields
  URL_FIELDS.forEach(field => {
    // Skip null or undefined values
    if (item[field] && item[field] !== null && typeof item[field] === 'string') {
      urls.push({
        url: item[field],
        source: `${manifestFile} → ${itemId} → ${field}`,
        itemId,
        field,
      })
    }
  })

  // Nested resourceUrls object (for base-product schema)
  if (item.resourceUrls && typeof item.resourceUrls === 'object') {
    Object.entries(item.resourceUrls).forEach(([key, value]) => {
      // Skip null or undefined values
      if (value && value !== null && typeof value === 'string') {
        urls.push({
          url: value,
          source: `${manifestFile} → ${itemId} → resourceUrls.${key}`,
          itemId,
          field: `resourceUrls.${key}`,
        })
      }
    })
  }

  // Nested communityUrls object (for base-product schema)
  if (item.communityUrls && typeof item.communityUrls === 'object') {
    Object.entries(item.communityUrls).forEach(([key, value]) => {
      // Skip null or undefined values
      if (value && value !== null && typeof value === 'string') {
        urls.push({
          url: value,
          source: `${manifestFile} → ${itemId} → communityUrls.${key}`,
          itemId,
          field: `communityUrls.${key}`,
        })
      }
    })
  }

  // Nested platformUrls object (for providers schema)
  if (item.platformUrls && typeof item.platformUrls === 'object') {
    Object.entries(item.platformUrls).forEach(([key, value]) => {
      // Skip null or undefined values
      if (value && value !== null && typeof value === 'string') {
        urls.push({
          url: value,
          source: `${manifestFile} → ${itemId} → platformUrls.${key}`,
          itemId,
          field: `platformUrls.${key}`,
        })
      }
    })
  }

  return urls
}

/**
 * Load all URLs from manifest files
 */
function loadAllUrls() {
  const allUrls = []
  const manifestsDir = path.join(rootDir, 'manifests')

  for (const manifestFile of MANIFEST_FILES) {
    const manifestPath = path.join(manifestsDir, manifestFile)

    if (!fs.existsSync(manifestPath)) {
      console.warn(`⚠️  Manifest file not found: ${manifestFile}`)
      continue
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf8')
      const data = JSON.parse(content)

      // Handle collections.json special structure
      if (manifestFile === 'collections.json') {
        if (typeof data === 'object' && data !== null) {
          // Process each section (specifications, articles, tools)
          Object.entries(data).forEach(([sectionName, section]) => {
            if (section?.cards && Array.isArray(section.cards)) {
              section.cards.forEach(card => {
                if (card?.items && Array.isArray(card.items)) {
                  card.items.forEach(item => {
                    const urls = extractUrls(
                      item,
                      `${manifestFile} → ${sectionName} → ${card.title}`
                    )
                    allUrls.push(...urls)
                  })
                }
              })
            }
          })
        }
      } else if (Array.isArray(data)) {
        data.forEach(item => {
          const urls = extractUrls(item, manifestFile)
          allUrls.push(...urls)
        })
      } else {
        console.warn(`⚠️  ${manifestFile} is not an array or collections object, skipping`)
      }
    } catch (error) {
      console.error(`❌ Error reading ${manifestFile}: ${error.message}`)
    }
  }

  return allUrls
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
  let currentIndex = 0

  console.log(
    `\n🔗 Checking ${total} URLs with up to ${MAX_CONCURRENT_REQUESTS} concurrent requests...\n`
  )

  return new Promise(resolve => {
    let activeRequests = 0

    const processNext = () => {
      // Check if we're done
      if (completed === total) {
        resolve({ results, total, valid, invalid })
        return
      }

      // Start new requests up to the concurrency limit
      while (activeRequests < MAX_CONCURRENT_REQUESTS && currentIndex < total) {
        const urlInfo = urls[currentIndex++]
        activeRequests++

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

  // Validate all URLs
  const { results, total, valid, invalid } = await validateUrls(uniqueUrls)

  // Save results to log file
  saveValidationLog(results)
  console.log(`\n💾 Saved validation results to: ${VALIDATED_URLS_LOG}`)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`\n📊 Summary:`)
  console.log(`   Total URLs: ${total}`)
  console.log(`   Valid: ${valid} ✅`)
  console.log(`   Invalid: ${invalid} ❌`)
  console.log(`   Success rate: ${((valid / total) * 100).toFixed(1)}%`)

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
