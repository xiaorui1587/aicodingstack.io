#!/usr/bin/env node

/**
 * Validate Scripts Entry Point
 *
 * This script runs all validation scripts.
 * Can be called from CI or manually.
 *
 * Usage:
 *   node scripts/validate/index.mjs [script-name]
 *
 * If no script name is provided, runs all scripts (excluding urls).
 */

import { runCategoryScripts } from '../_shared/runner.mjs'

runCategoryScripts({
  categoryName: 'validate',
  excludes: ['urls'],
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
