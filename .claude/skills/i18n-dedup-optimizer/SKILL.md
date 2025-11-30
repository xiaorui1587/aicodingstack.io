---
name: i18n-dedup-optimizer
description: Analyze and optimize duplicate translation keys in English locale files. Use this skill when working on internationalization (i18n) improvements, reducing translation duplication, or consolidating repeated translation values across locale JSON files. The skill identifies duplicate values, suggests consolidation strategies, and helps refactor translation references to follow DRY principles.
---

# I18n Dedup Optimizer

## Overview

Analyze and optimize duplicate translation keys in the English locale files to follow DRY (Don't Repeat Yourself) principles. This skill identifies duplicate translation values, suggests consolidation opportunities, and guides the refactoring process to reduce redundancy while maintaining proper i18n structure.

## Workflow

The optimization process follows a systematic workflow to ensure safe and effective consolidation of duplicate translations.

### Step 1: Run Duplicate Analysis

Execute the analysis script to identify all duplicate translation values in the English locale files:

```bash
node .claude/skills/i18n-dedup-optimizer/scripts/analyze-duplicates.mjs
```

The script will:
- Scan all JSON files in `locales/en/`
- Identify exact duplicate values (same text appearing multiple times)
- Detect semantic patterns (e.g., "Back to X", "View X")
- Generate a detailed report with statistics and suggestions

**Output includes:**
- Total files and translation keys analyzed
- Number of existing references (already optimized)
- List of duplicate values with their locations
- Pattern analysis for common duplications
- Consolidation suggestions with recommended target keys

### Step 2: Review Analysis Report

Carefully review the analysis output to understand the duplication landscape:

1. **Check statistics**: Understand the scope of duplication
2. **Review exact duplicates**: Identify high-priority consolidation targets
3. **Examine patterns**: Look for systematic duplication patterns
4. **Evaluate suggestions**: Assess the proposed consolidation targets

**Key considerations:**
- Not all duplicates should be consolidated (some may be coincidentally identical)
- Context matters - ensure consolidated keys make semantic sense
- Prefer moving values to appropriate namespaces (`shared`, `components`, or `pages`)

Refer to `references/i18n-structure.md` for detailed information about:
- Namespace organization and hierarchy
- Reference syntax (`@:namespace.key.path`)
- Best practices for consolidation
- Common duplication patterns

### Step 3: Propose Consolidation Strategy

Based on the analysis, create a consolidation plan for user approval:

1. **Categorize duplicates** by priority:
   - High priority: Exact duplicates used 3+ times
   - Medium priority: Exact duplicates used 2 times
   - Low priority: Parameterized duplicates or edge cases

2. **Group by consolidation target**:
   - `shared` namespace for cross-cutting terms
   - `components` namespace for UI-related terms
   - Keep page-specific terms in page namespaces

3. **Prepare detailed proposal** including:
   - List of values to consolidate
   - Target location for each value
   - Keys that will be updated to use references
   - Estimated impact (number of keys reduced)

**Present the proposal to the user in a clear, structured format:**

```
Consolidation Proposal
═══════════════════════

Priority 1: High-Impact Duplicates
───────────────────────────────────
1. "Compare All" (3 occurrences)
   Target: shared.actions.compareAll
   Will update:
   - pages.clis.compareAll → @:shared.actions.compareAll
   - pages.extensions.compareAll → @:shared.actions.compareAll
   - pages.ides.compareAll → @:shared.actions.compareAll

2. "Back to" (5 occurrences)
   Target: shared.actions.backTo
   Will update: [list specific keys]
   ...

Estimated reduction: 15 translation keys
```

**Wait for user approval before proceeding.**

### Step 4: Perform Consolidation

Once approved, systematically refactor the translation files:

#### 4.1 Update JSON Files

For each approved consolidation:

1. **Ensure target key exists** in the appropriate namespace file
2. **Update referencing keys** to use `@:` syntax
3. **Remove duplicate values** from their original locations

**Example transformation:**

Before:
```json
// pages/clis.json
{
  "clis": {
    "compareAll": "Compare All"
  }
}

// pages/extensions.json
{
  "extensions": {
    "compareAll": "Compare All"
  }
}
```

After:
```json
// shared.json
{
  "actions": {
    "compareAll": "Compare All"
  }
}

// pages/clis.json
{
  "clis": {
    "compareAll": "@:shared.actions.compareAll"
  }
}

// pages/extensions.json
{
  "extensions": {
    "compareAll": "@:shared.actions.compareAll"
  }
}
```

#### 4.2 Update Component/Page Code (if needed)

If translation key paths change, update the corresponding component or page code:

**Before:**
```tsx
t('pages.clis.compareAll')
```

**After:**
```tsx
// If the key path is preserved, no code change needed
t('pages.clis.compareAll') // Still works via reference

// If the key path changed directly
t('shared.actions.compareAll')
```

**Note:** When using references (`@:`), the original key path still works, so code updates are often unnecessary. Only update code if keys are completely removed or restructured.

#### 4.3 Apply to All Languages

After updating English locale files:

1. **Copy the structure** to other language directories (`zh-Hans`, `de`, `ko`)
2. **Keep translated values** but use same `@:` references
3. **Maintain consistency** across all language files

**Example for German:**
```json
// locales/de/shared.json
{
  "actions": {
    "compareAll": "Alle vergleichen"  // Translated value
  }
}

// locales/de/pages/clis.json
{
  "clis": {
    "compareAll": "@:shared.actions.compareAll"  // Same reference
  }
}
```

### Step 5: Verification

After completing consolidation, verify the changes:

1. **Run the analysis script again** to confirm reduction in duplicates
2. **Build the project** to catch any reference errors:
   ```bash
   npm run build
   ```
3. **Test key pages** in all supported languages
4. **Check for console warnings** about missing translation keys

**Verification checklist:**
- [ ] Analysis shows reduced duplicate count
- [ ] Build completes without errors
- [ ] All pages render correctly in English
- [ ] All pages render correctly in other languages
- [ ] No console warnings about missing keys
- [ ] Translations display correctly at runtime

## Common Consolidation Patterns

### Action Verbs
Consolidate into `shared.actions`:
- "Compare", "Compare All", "Download", "Explore", "View", "Visit"
- "Follow on {platform}", "Join {platform}", "Watch on {platform}"
- "Back to", "Back to top"

### Platform Names
Use `shared.platforms`:
- "GitHub", "Discord", "LinkedIn", "X (Twitter)", "YouTube", "Reddit"
- "Artificial Analysis", "HuggingFace", "OpenRouter"

### Stack Types
Use `shared.stack` (singular) or `shared.stacks` (plural):
- "CLI" / "CLIs", "Extension" / "Extensions", "IDE" / "IDEs"
- "Model" / "Models", "Model Provider" / "Model Providers", "Vendor" / "Vendors"

### Product Detail Fields
Reference `components.productHero`:
- "Documentation", "Download", "License", "Platforms", "Stars"
- "Vendor", "Version", "Visit Website", "Get API Key"

### Navigation Patterns
Consider parameterization for repeated patterns:
- "Back to X" → "Back to {target}"
- "All X" → "All {items}"
- "View X" → "View {name}"

## Resources

### scripts/analyze-duplicates.mjs
Node.js script that scans English locale files and generates a comprehensive duplication report.

**Features:**
- Recursive JSON file scanning
- Flattens nested objects to dot-notation paths
- Identifies exact and parameterized duplicates
- Detects common patterns (action verbs, navigation, etc.)
- Suggests consolidation targets based on namespace priority

**Usage:** `node .claude/skills/i18n-dedup-optimizer/scripts/analyze-duplicates.mjs`

### references/i18n-structure.md
Comprehensive documentation of the project's i18n structure:
- Directory and namespace organization
- Reference syntax and resolution rules
- Best practices and naming conventions
- Common duplication patterns
- File organization rules
- Complete optimization workflow

Load this reference when needing detailed context about the i18n system structure.

## Best Practices

### Consolidation Priority
1. **`shared` namespace**: Cross-cutting terms used across multiple pages and components
2. **`components` namespace**: Component-specific but reusable UI terms
3. **`pages` namespace**: Page-specific terms that happen to be duplicated

### Safety Guidelines
- Always get user approval before making changes
- Test thoroughly after consolidation
- Maintain consistency across all language files
- Preserve the semantic meaning of translations
- Keep git commits organized by consolidation batch

### Efficiency Tips
- Start with high-impact duplicates (3+ occurrences)
- Consolidate related terms together (e.g., all action verbs at once)
- Use pattern-based consolidation for systematic duplicates
- Run analysis periodically to prevent new duplications
