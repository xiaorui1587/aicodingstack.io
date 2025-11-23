# Scripts Documentation

This directory contains utility scripts for managing and validating the AI Coding Stack project. Scripts are organized into four categories:

- **`validate/`** - Validation scripts that check data integrity
- **`generate/`** - Generation scripts that create derived files
- **`refactor/`** - Refactoring scripts that reorganize or reformat data
- **`fetch/`** - Data fetching scripts that retrieve external data

## Directory Structure

```
scripts/
├── validate/
│   ├── index.mjs              # Entry point for all validation scripts
│   ├── validate-manifests.mjs
│   ├── validate-github-stars.mjs
│   └── validate-urls.mjs
├── generate/
│   ├── index.mjs              # Entry point for all generation scripts
│   ├── generate-manifest-indexes.mjs
│   └── generate-metadata.mjs
├── refactor/
│   ├── index.mjs              # Entry point for all refactoring scripts
│   └── sort-manifest-fields.mjs
└── fetch/
    ├── index.mjs              # Entry point for all fetch scripts
    └── fetch-github-stars.mjs
```

## Usage

### Running All Scripts in a Category

Each category has an entry point script (`index.mjs`) that can run all scripts in that category:

```bash
# Run all validation scripts
npm run validate

# Run all generation scripts
npm run generate

# Run all refactoring scripts
npm run refactor

# Run all fetch scripts
npm run fetch
```

### Running Individual Scripts

You can also run individual scripts by passing the script name to the entry point:

```bash
# Validation scripts
npm run validate:manifests
npm run validate:github-stars
npm run validate:urls

# Generation scripts
npm run generate:manifests
npm run generate:metadata

# Refactoring scripts
npm run refactor:sort-fields

# Fetch scripts
npm run fetch:github-stars
```

Or directly using Node:

```bash
# Run specific script
node scripts/validate/index.mjs manifests
node scripts/generate/index.mjs metadata
node scripts/fetch/index.mjs github-stars
```

## Validation Scripts

### validate-manifests.mjs

Validates all manifest JSON files against their corresponding JSON schemas.

```bash
npm run validate:manifests
```

**What it checks:**
- JSON syntax validity
- Schema compliance for each manifest type
- Required fields presence
- Field format validation (URLs, enums, etc.)
- Filename matches the `id` field in the manifest

**Manifest types validated:**
- `manifests/clis/*.json` - CLI tools
- `manifests/ides/*.json` - IDEs
- `manifests/extensions/*.json` - Editor extensions
- `manifests/providers/*.json` - API providers
- `manifests/models/*.json` - LLM models
- `manifests/vendors/*.json` - Vendor information
- `manifests/collections.json` - Collections data

### validate-github-stars.mjs

Validates that entries in `data/github-stars.json` match the actual manifest files.

```bash
npm run validate:github-stars
```

**What it checks:**
- All entries in `github-stars.json` have corresponding manifest files
- All manifest files are present in `github-stars.json`
- No orphaned entries in either direction

**Categories validated:**
- `extensions`
- `clis`
- `ides`

**Common issues:**
- Orphaned entries: Entries in `github-stars.json` without manifest files
- Missing entries: Manifest files without corresponding `github-stars.json` entries

**How to fix:**
1. Remove orphaned entries from `data/github-stars.json`
2. Add missing entries to `data/github-stars.json` (set value to `null` if unknown)
3. Or remove unused manifest files if they are not needed

### validate-urls.mjs

Validates URLs in manifest files to ensure they are accessible.

```bash
npm run validate:urls
```

**What it checks:**
- URL accessibility (HTTP status codes)
- Network connectivity
- URL format validity

**Note:** This script may take a while as it makes HTTP requests to validate each URL.

## Generation Scripts

### generate-manifest-indexes.mjs

Generates TypeScript index files from individual manifest files.

```bash
npm run generate:manifests
```

**What it generates:**
- `src/lib/generated/ides.ts` - IDE manifest index
- `src/lib/generated/clis.ts` - CLI manifest index
- `src/lib/generated/models.ts` - Model manifest index
- `src/lib/generated/providers.ts` - Provider manifest index
- `src/lib/generated/extensions.ts` - Extension manifest index
- `src/lib/generated/vendors.ts` - Vendor manifest index
- `src/lib/generated/index.ts` - Main manifest index
- `src/lib/generated/github-stars.ts` - GitHub stars data

### generate-metadata.mjs

Generates TypeScript metadata files from MDX content and manifest data.

```bash
npm run generate:metadata
```

**What it generates:**
- `src/lib/generated/metadata.ts` - Articles, docs, FAQ, and collections metadata
- `src/lib/generated/articles.ts` - Article components and metadata
- `src/lib/generated/docs.ts` - Doc components and metadata
- `src/lib/generated/manifesto.ts` - Manifesto component loader

## Refactoring Scripts

### sort-manifest-fields.mjs

Sorts fields in manifest JSON files according to their schema definitions.

```bash
npm run refactor:sort-fields
```

**What it does:**
- Reorders fields in manifest files to match schema property order
- Ensures consistent field ordering across all manifests
- Handles nested objects and arrays

## Data Fetching Scripts

### fetch-github-stars.mjs

Fetches GitHub star counts for projects listed in manifests.

```bash
npm run fetch:github-stars
```

**What it does:**
- Reads `githubUrl` from manifest files
- Fetches star counts from GitHub API
- Updates `data/github-stars.json` with latest counts

**Environment variables:**
- `GITHUB_TOKEN` - Optional GitHub token to avoid rate limits (recommended)

**Note:** Without a GitHub token, you may hit rate limits (60 requests/hour).

## Build Process

The build process runs validation and generation scripts automatically:

```bash
npm run build:next
```

This runs in order:
1. `validate:manifests` - Validate all manifest schemas
2. `validate:github-stars` - Validate github-stars.json consistency
3. `generate:manifests` - Generate manifest indexes
4. `generate:metadata` - Generate TypeScript metadata
5. Next.js build

## Development Workflow

During development, use:

```bash
npm run dev
```

This will:
1. Generate manifest indexes
2. Generate metadata
3. Start Next.js development server

## CI/CD Integration

For CI/CD pipelines, you can use the entry point scripts to run all scripts in a category:

```bash
# Run all validations (recommended for CI)
npm run validate

# Run all generation scripts
npm run generate

# Run all refactoring scripts
npm run refactor

# Run all fetch scripts (if needed)
npm run fetch
```

Or run individual scripts as needed:

```bash
npm run validate:manifests
npm run generate:manifests
npm run generate:metadata
npm run refactor:sort-fields
```

## Manual Execution

To run scripts manually without npm:

```bash
# Run all scripts in a category
node scripts/validate/index.mjs
node scripts/generate/index.mjs
node scripts/fetch/index.mjs

# Run specific script
node scripts/validate/index.mjs manifests
node scripts/generate/index.mjs metadata
node scripts/fetch/index.mjs github-stars
```
