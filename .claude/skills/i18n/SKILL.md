---
name: i18n
description: Internationalization management tool for syncing and translating language files
---

# I18n Management Skill

Manage multilingual content in the `locales/` directory. This skill provides tools to synchronize language files with the English reference and assist with translations.

## Overview

This project uses `next-intl` for internationalization with JSON message files stored in `locales/`:

- `locales/en.json` - English (source of truth)
- `locales/zh-Hans.json` - Simplified Chinese
- Additional language files can be added

All language files must maintain the same nested key structure as `en.json`.

## Subcommands

### `sync`

Synchronize all language files with `en.json` as the source of truth.

**What it does:**

- Scans all `.json` files in `locales/` directory
- Compares each file's keys with `en.json`
- **Adds missing keys** with English text as placeholder (needs translation)
- **Removes extra keys** not present in `en.json`
- Preserves JSON structure and formatting (2-space indentation)

**Usage:**

When you need to sync language files, use this command in Claude Code:

```
Please run the i18n sync command
```

Claude Code will execute:

```bash
node .claude/skills/i18n/scripts/sync.mjs
```

**Output Example:**

```
🔄 Syncing language files with en.json...

✓ Synced zh-Hans.json
  + Added 3 keys
  - Removed 1 key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Sync complete!
  Modified: 1 file
  Added: 3 keys
  Removed: 1 key
```

**When to use:**

- After adding new keys to `en.json`
- After removing obsolete keys from `en.json`
- Before starting translation work (ensures all keys exist)
- When adding a new language file

---

### `translate <locale>`

Generate translation tasks for Claude Code to translate missing content.

**What it does:**

- Reads `en.json` and `<locale>.json`
- Identifies keys that need translation (currently in English or missing)
- Outputs a structured translation task with guidelines
- Provides context and instructions for accurate translation

**Usage:**

When you need to translate content, use this command in Claude Code:

```
Please run the i18n translate command for zh-Hans
```

Claude Code will execute:

```bash
node .claude/skills/i18n/scripts/translate.mjs zh-Hans
```

**Workflow:**

1. The script outputs content that needs translation in JSON format
2. Claude Code reads the guidelines and translates the content
3. You provide the translated JSON back
4. Claude Code updates the language file

**Translation Guidelines (automatically enforced):**

✓ **Preserve brand names:** `AI Coding Stack`, `Claude Code`, etc.
✓ **Keep placeholders intact:** `{count}`, `{name}`, `${variable}`
✓ **Don't translate URLs:** `https://example.com`
✓ **Don't translate file paths:** `/path/to/file`
✓ **Maintain terminology consistency** throughout the translation

**Supported Locales:**

- `zh-Hans` - 简体中文 (Simplified Chinese)
- `zh-Hant` - 繁體中文 (Traditional Chinese)
- `ja` - 日本語 (Japanese)
- `ko` - 한국어 (Korean)
- `fr` - Français (French)
- `de` - Deutsch (German)
- `es` - Español (Spanish)
- `pt` - Português (Portuguese)
- `ru` - Русский (Russian)

**Output Example:**

```
🌐 Translation Assistant for zh-Hans

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Translation Task
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target Language: 简体中文 (Simplified Chinese)
Entries to translate: 15

⚠ Translation Guidelines:
  1. Preserve brand names: "AI Coding Stack", "Claude Code"
  2. Keep placeholders intact: {count}, {name}, ${variable}
  3. Don't translate URLs and file paths
  4. Maintain consistent terminology

Content to translate:

{
  "pages.home.title": "Welcome to AI Coding Stack",
  "pages.home.description": "Discover the best AI coding tools",
  ...
}
```

---

## File Structure

```
.claude/skills/i18n/
├── SKILL.md              # This documentation
└── scripts/
    ├── sync.mjs          # Synchronization script
    └── translate.mjs     # Translation assistant script
```

## Technical Details

**Language:** Node.js (ES Modules)
**Dependencies:** Built-in Node.js modules only (`fs`, `path`)
**JSON Format:** 2-space indentation, trailing newline
**Encoding:** UTF-8

### How Keys Are Compared

The scripts use recursive traversal to handle nested JSON structures. Keys are compared using dot notation:

```json
{
  "pages": {
    "home": {
      "title": "Welcome"
    }
  }
}
```

Becomes: `pages.home.title = "Welcome"`

### Adding a New Language

1. Add the locale to `src/i18n/config.ts`:

```typescript
export const locales = ['en', 'zh-Hans', 'ja'] as const; // Add 'ja'
```

2. Create an empty JSON file or copy `en.json`:

```bash
cp locales/en.json locales/ja.json
```

3. Run sync to ensure structure matches:

```
Please run the i18n sync command
```

4. Run translate to generate translation tasks:

```
Please run the i18n translate command for ja
```

## Best Practices

1. **Always run `sync` before `translate`** to ensure all keys exist
2. **Make changes to `en.json` first**, then sync other languages
3. **Review translations** for context accuracy, especially technical terms
4. **Use Git** to track changes and review diffs before committing
5. **Keep brand names consistent** across all languages
6. **Test translations** in the actual UI to verify formatting and length

## Troubleshooting

**Problem:** Script says "file not found"

- **Solution:** Ensure you're running from project root
- Check that `locales/` directory exists

**Problem:** Keys are out of sync after adding new content

- **Solution:** Run `sync` command to update all language files

**Problem:** Translation contains placeholders like `{0}` instead of `{count}`

- **Solution:** Verify the English source uses named placeholders, re-translate

**Problem:** Some text appears in English in the translated app

- **Solution:** Run `translate` to find missing translations, check for English fallbacks

## Integration with next-intl

This skill is designed to work with the project's `next-intl` setup:

```typescript
// src/i18n/request.ts
export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../../locales/${locale}.json`)).default,
}));
```

The JSON files are loaded dynamically based on the current locale.

## License

This skill is part of the AI Coding Stack project and follows the project's Apache 2.0 license.
