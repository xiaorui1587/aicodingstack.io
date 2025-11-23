#!/usr/bin/env node

/**
 * Manifest Creator Script
 *
 * This script is invoked by Claude Code to guide the manifest creation process.
 * The actual work is done by Claude Code using WebFetch, WebSearch, and file tools.
 *
 * Usage: node .claude/skills/manifest-creator/scripts/create.mjs <type> <name> <url>
 *
 * Arguments:
 *   type - Manifest type: cli, extension, ide, model, provider, vendor
 *   name - Product name (will be used as filename without .json)
 *   url  - Official website URL (becomes websiteUrl field)
 *
 * Example:
 *   node .claude/skills/manifest-creator/scripts/create.mjs cli copilot-cli https://github.com/github/copilot-cli
 */

const args = process.argv.slice(2)

if (args.length < 3) {
  console.error('❌ Error: Missing required arguments')
  console.error('')
  console.error('Usage: create.mjs <type> <name> <url>')
  console.error('')
  console.error('Arguments:')
  console.error('  type - Manifest type: cli, extension, ide, model, provider, vendor')
  console.error('  name - Product name (filename without .json)')
  console.error('  url  - Official website URL')
  console.error('')
  console.error('Example:')
  console.error('  node create.mjs cli copilot-cli https://github.com/github/copilot-cli')
  process.exit(1)
}

const [type, name, url] = args

// Validate manifest type
const validTypes = ['cli', 'extension', 'ide', 'model', 'provider', 'vendor']
if (!validTypes.includes(type)) {
  console.error(`❌ Error: Invalid manifest type "${type}"`)
  console.error(`Valid types: ${validTypes.join(', ')}`)
  process.exit(1)
}

// Validate URL format
try {
  new URL(url)
  if (!url.startsWith('https://')) {
    console.error('❌ Error: URL must use HTTPS protocol')
    process.exit(1)
  }
} catch (error) {
  console.error(`❌ Error: Invalid URL format: ${url}`)
  process.exit(1)
}

// Validate name format (lowercase with hyphens)
if (!/^[a-z0-9-]+$/.test(name)) {
  console.error('❌ Error: Name must be lowercase with hyphens only')
  console.error(`   Example: "github-copilot" not "GitHub Copilot"`)
  process.exit(1)
}

// Output the creation task prompt
console.log('🚀 Manifest Creator')
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 Task Details')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log(`Manifest Type: ${type}`)
console.log(`Product Name:  ${name}`)
console.log(`Website URL:   ${url}`)
console.log('')
console.log(`Schema Path:   manifests/schemas/${type}s.schema.json`)
console.log(`Output Path:   manifests/${type}s/${name}.json`)
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📝 Workflow Instructions for Claude Code')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('Step 1: Read the Schema')
console.log('  → Read manifests/schemas/' + type + 's.schema.json')
console.log('  → Read referenced schema files (entity.schema.json, etc.)')
console.log('  → Understand all required fields and their formats')
console.log('')
console.log('Step 2: Extract Website Content')
console.log('  → Use WebFetch to read: ' + url)
console.log('  → Extract: name, description, version, features')
console.log('  → If main page lacks info, follow relevant links')
console.log('  → CRITICAL: Description must be from actual content, not generated')
console.log('')
console.log('Step 3: Gather Additional Information')
console.log('  → Search for documentation URL (docsUrl)')
console.log('  → Search for GitHub repository (githubUrl)')
console.log('  → Find pricing information (if applicable)')
console.log('  → Discover community presence (social media, Discord, etc.)')
console.log('')

if (type === 'model' || type === 'provider') {
  console.log('Step 4: Find Platform URLs')
  console.log('  → Use WebSearch to find HuggingFace page')
  console.log('  → Use WebSearch to find Artificial Analysis page')
  console.log('  → Use WebSearch to find OpenRouter page')
  console.log('  → Set to null if not found')
  console.log('')
}

console.log('Step 5: Generate Manifest JSON')
console.log('  → Create complete manifest with all required fields')
console.log('  → Use proper formatting (2-space indentation)')
console.log('  → Set unavailable fields to null (not empty string)')
console.log('  → Ensure all URLs use HTTPS protocol')
console.log('  → ID should be: ' + name)
console.log('')
console.log('Step 6: Write Manifest File')
console.log('  → Write to: manifests/' + type + 's/' + name + '.json')
console.log('  → Use proper JSON formatting (2-space indentation)')
console.log('  → Ensure all required fields are present')
console.log('')
console.log('Step 7: Validate Manifest')
console.log('  → Run: node scripts/validate-manifests.mjs')
console.log('  → Check for schema compliance')
console.log('  → Verify all required fields')
console.log('  → Fix any validation errors if found')
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('⚠️  Important Reminders')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('✓ Never generate descriptions - extract from website')
console.log('✓ All URLs must be valid and use HTTPS')
console.log('✓ Use null for missing fields, not empty strings')
console.log('✓ Follow schema field requirements exactly')
console.log('✓ Verify pricing information is current')
console.log('✓ Check that community URLs are official')
console.log('✓ ALWAYS run validation script after creating manifest')
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('✅ Ready to create manifest!')
console.log('   Claude Code will now execute the workflow above.')
console.log('')
