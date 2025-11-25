# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Internationalization (i18n)

**CRITICAL REQUIREMENTS:**

When creating or modifying any page, module, or data:
- **MUST support at least 3 languages:** English, Simplified Chinese (zh-Hans), and German (de)
- **MUST use the localized Link component:** Always import and use `import { Link } from '@/i18n/navigation'` instead of Next.js default Link

### Localization Best Practices

- **Metadata localization:** All meta information (titles, descriptions, keywords, OG tags, etc.) in pages MUST be properly localized
- **DRY principle for translations:** Before creating new translation keys, search existing translation modules thoroughly to reuse existing terms and phrases
- **Consistency:** Use the same translation keys across similar contexts

## Design System

**Global Design Principles:**

- **Minimalist approach:** Follow a unified, extremely minimalist design style throughout the entire application
- **No rounded corners:** All controls, components, labels, and UI elements MUST use sharp corners (border-radius: 0)
- **Restrained color usage:** Use colors extremely sparingly and intentionally. Prefer grayscale and limit accent colors to essential UI elements only. If colors must be used, prefer low-saturation designs.
- **Icon usage:** Avoid using emoji or any other characters as icons. Prioritize SVG for icons.
- **Page width:**
  - `max-w-8xl`: for all pages globally
  - `max-w-5xl`: for content pages and homepage

## Coding Principles

**CRITICAL: Follow these principles rigorously in all code:**

### DRY - Don't Repeat Yourself
- Eliminate code duplication by extracting common logic
- Reuse existing components, functions, and translation keys
- Create shared utilities when patterns emerge

## Development Workflow

- **Development server:** Do not start `npm run dev` automatically. User will start it manually when needed.
- **Git commits:** Do not create commits autonomously. Always ask the user before committing changes.
