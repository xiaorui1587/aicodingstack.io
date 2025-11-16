# Manifest i18n Guide

This document describes how to add multi-language support for manifest files.

## Overview

We use **Solution 4 (Hybrid Approach)**: Add an `i18n` field to each manifest entry to store translations.

## Structure

```json
{
  "id": "example",
  "name": "Example Tool",
  "description": "This is an example tool for demonstration.",
  // ... other fields ...
  "i18n": {
    "zh-Hans": {
      "description": "这是一个用于演示的示例工具。"
    }
  }
}
```

## Supported Languages

Currently supported languages (defined in `src/i18n/config.ts`):
- `en` (English) - Default language
- `zh-Hans` (Simplified Chinese)

## Translatable Fields

Currently supports translating the following fields:
- `description` - Tool description

Future extensions can include:
- `name` - Tool name (if localized names are needed)
- Other custom fields

## Steps to Add Translations

### 1. Add Translation in Manifest File

Edit the corresponding manifest file (e.g., `manifests/terminals.json`):

```json
{
  "id": "warp",
  "name": "Warp",
  "description": "Warp is a modern Rust-based terminal emulator with AI-powered features.",
  "i18n": {
    "zh-Hans": {
      "description": "Warp 是一款基于 Rust 的现代终端模拟器，具有 AI 驱动的功能。"
    }
  }
}
```

### 2. Use Translations in Code

We provide utility functions in `src/lib/manifest-i18n.ts` to handle translations:

```typescript
import { localizeManifestItem } from '@/lib/manifest-i18n';
import type { Locale } from '@/i18n/config';
import terminals from '@/../../manifests/terminals.json';

// In a page component
export default async function TerminalPage({ params }) {
  const { locale, slug } = await params;
  const terminalRaw = terminals.find((t) => t.id === slug);

  // Apply localization
  const terminal = localizeManifestItem(terminalRaw, locale as Locale);

  // Now terminal.description will automatically return the appropriate translation
  // If locale is 'zh-Hans', returns Chinese; if 'en' or no translation, returns English
}
```

### 3. Batch Process Multiple Entries

For list pages, use `localizeManifestItems`:

```typescript
import { localizeManifestItems } from '@/lib/manifest-i18n';

const localizedTerminals = localizeManifestItems(terminals, locale);
```

## API Reference

### `localizeManifestItem<T>(item: T, locale: Locale, fields?: (keyof T)[]): T`

Applies localization to a single manifest entry.

**Parameters:**
- `item` - Manifest entry object
- `locale` - Target language ('en' or 'zh-Hans')
- `fields` - List of fields to translate (optional, defaults to `['description']`)

**Returns:** A new object with translations applied

### `localizeManifestItems<T>(items: T[], locale: Locale, fields?: (keyof T)[]): T[]`

Applies localization to an array of manifest entries.

**Parameters:**
- `items` - Array of manifest entries
- `locale` - Target language
- `fields` - List of fields to translate (optional)

**Returns:** A new array with translations applied

### `getLocalizedField<T>(item: T, field: keyof T, locale: Locale): string`

Gets the localized value of a single field.

**Parameters:**
- `item` - Manifest entry object
- `field` - Field name
- `locale` - Target language

**Returns:** Localized field value (returns original value if no translation exists)

## Examples

### terminals.json Example

```json
[
  {
    "id": "iterm2",
    "name": "iTerm2",
    "vendor": "George Nachman",
    "description": "iTerm2 is a terminal emulator for macOS.",
    "i18n": {
      "zh-Hans": {
        "description": "iTerm2 是一款 macOS 终端模拟器。"
      }
    }
  }
]
```

### providers.json Example

```json
[
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "description": "A leading AI research company focused on developing advanced language models.",
    "i18n": {
      "zh-Hans": {
        "description": "领先的 AI 研究公司，专注于开发先进的语言模型。"
      }
    }
  }
]
```

## Best Practices

1. **Maintain Consistency** - Ensure all entries of the same type have translations for the same languages
2. **Accurate Translation** - Translations should accurately convey the original meaning, avoid over-interpretation
3. **Be Concise** - Descriptions should be brief and easy to understand
4. **Validate JSON** - Ensure JSON format is correct after adding translations
5. **Progressive Addition** - Start by adding translations for important entries, then gradually complete others

## Contributing Translations

We welcome contributors to add translations to manifests!

1. Fork this project
2. Add `i18n` fields to manifest files
3. Submit a PR describing your translations
4. Wait for review and merge

## Future Extensions

- Support for more languages (Japanese, Korean, etc.)
- Support for more translatable fields
- Automatic detection of missing translations
- Translation quality check tools
