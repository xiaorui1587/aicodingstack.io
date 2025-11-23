#!/usr/bin/env node

/**
 * Refactor Scripts Entry Point
 *
 * This script runs all refactoring scripts.
 * Can be called from CI or manually.
 *
 * Usage:
 *   node scripts/refactor/index.mjs [script-name]
 *
 * If no script name is provided, runs all scripts.
 *
 * Note: For includes/excludes, use the script name without .mjs extension.
 * For example, 'sort-manifest-fields' (not 'sort-manifest-fields.mjs')
 */

import { runCategoryScripts } from '../_shared/runner.mjs'

runCategoryScripts({
  categoryName: 'refactor',
  // Example: excludes: ['sort-manifest-fields'] to exclude it
  // Example: includes: ['sort-manifest-fields'] to only run it
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
