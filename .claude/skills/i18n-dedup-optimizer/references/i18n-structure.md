# I18n Structure Reference

This document describes the internationalization structure for the AI Coding Stack project.

## Directory Structure

```
locales/
├── en/
│   ├── index.ts              # Main export file
│   ├── shared.json           # Shared translations (actions, common, platforms, stack)
│   ├── components.json       # Component-specific translations
│   └── pages/
│       ├── articles.json
│       ├── comparison.json
│       ├── curated-collections.json
│       ├── docs.json
│       ├── home.json
│       ├── manifesto.json
│       └── stacks.json       # All stack-related pages
├── zh-Hans/                  # Simplified Chinese (same structure)
├── de/                       # German (same structure)
└── ko/                       # Korean (same structure)
```

## Namespace Organization

The translation keys are organized into namespaces:

### `shared` namespace
Contains cross-cutting translations used across multiple pages and components:
- `actions`: User actions (compare, download, explore, etc.)
- `common`: Common terms (aiCodingStack, articles, docs, etc.)
- `platforms`: Platform names (GitHub, Discord, LinkedIn, etc.)
- `stack`: Singular stack types (cli, extension, ide, model, etc.)
- `stacks`: Plural stack types (clis, extensions, ides, models, etc.)

### `components` namespace
Component-specific translations:
- `backToNavigation`
- `collectionScrollbar`
- `docsSidebar`
- `filterSortBar`
- `footer`
- `header`
- `openSourceRank`
- `productCommands`
- `productHero`
- `productLinks`
- `productPricing`
- `search`
- `sidebar`

### `pages` namespace
Page-specific translations organized by page type:
- `home`: Homepage content
- `manifesto`: Manifesto page
- `docs`: Documentation pages
- `articles`: Articles listing and detail
- `curatedCollections`: Curated collections
- Stack pages (spread from `stacks.json`):
  - `cliDetail`, `clis`
  - `extensionDetail`, `extensions`
  - `ideDetail`, `ides`
  - `modelDetail`, `models`
  - `modelProviderDetail`, `modelProviders`
  - `vendorDetail`, `vendors`
  - `overview`: Stack overview page
- `comparison`: Comparison pages for different stacks

## Reference Syntax

To avoid duplication, use the `@:` syntax to reference existing translations:

```json
{
  "title": "@:shared.stacks.clis",
  "backTo": "@:shared.actions.backTo",
  "compareAll": "@:shared.actions.compareAll"
}
```

### Reference Resolution Rules

1. **Absolute path**: Always use the full namespace path
   - ✅ `@:shared.actions.compare`
   - ✅ `@:components.productHero.license`
   - ❌ `@:actions.compare` (missing namespace)

2. **Namespace prefix**: Based on file location
   - `shared.json` → `shared.*`
   - `components.json` → `components.*`
   - `pages/*.json` → `pages.<pageName>.*`

## Best Practices

### 1. DRY Principle
Before creating a new translation key, check if an equivalent already exists:
- Search in `shared.json` first
- Check `components.json` for UI-related terms
- Look in similar pages for page-specific terms

### 2. Consolidation Priority
When consolidating duplicates, prefer moving values to:
1. **`shared` namespace**: For truly cross-cutting terms
2. **`components` namespace**: For component-specific but reusable terms
3. **Page namespace**: For page-specific terms

### 3. Naming Conventions
- Use camelCase for keys
- Group related terms under objects (e.g., `actions.*`, `platforms.*`)
- Use descriptive names that indicate the context

### 4. Parameterization
Use ICU message format for dynamic values:
```json
{
  "follow": "Follow on {platform}",
  "visit": "Visit {name}",
  "resultsCount": "{count} {count, plural, one {result} other {results}}"
}
```

## Common Duplication Patterns

### Action Verbs
Consolidate repeated action verbs into `shared.actions`:
- "Compare", "Download", "Explore", "View", "Visit", "Follow", "Join", "Watch"

### Platform Names
Use `shared.platforms` for all platform references:
- "GitHub", "Discord", "LinkedIn", "Twitter", "YouTube", "Reddit"

### Stack Types
Use `shared.stack` (singular) and `shared.stacks` (plural):
- "CLI" / "CLIs", "Extension" / "Extensions", "IDE" / "IDEs", "Model" / "Models"

### Product Hero Fields
Common product detail fields should reference `components.productHero`:
- "Documentation", "Download", "License", "Platforms", "Stars", "Vendor", "Version", "Visit Website"

### Navigation Patterns
Common navigation patterns:
- "Back to X" → Consider parameterized version in `shared.actions`
- "All X" → Consider pattern consolidation

## File Organization Rules

1. **`index.ts`**: Must import all JSON files and export a single `messages` object
2. **JSON files**: Must be valid JSON (no comments, trailing commas)
3. **Consistency**: All languages must have the same structure (keys may differ in values only)

## Optimization Workflow

1. Run `scripts/analyze-duplicates.mjs` to identify duplicates
2. Review the analysis report
3. Identify consolidation opportunities
4. Create a consolidation plan
5. Update JSON files with references
6. Update component/page code if translation paths change
7. Verify all references resolve correctly
8. Test with all supported languages
