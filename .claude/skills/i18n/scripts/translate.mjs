#!/usr/bin/env node

/**
 * Translate language file with Claude Code assistance
 *
 * This script:
 * 1. Reads messages/en.json and messages/<locale>.json
 * 2. Identifies keys that need translation (currently in English)
 * 3. Outputs translation tasks for Claude Code to perform
 * 4. Reads translated content from stdin
 * 5. Updates the target language file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Get project root (4 levels up from .claude/skills/i18n/scripts/)
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');
const MESSAGES_DIR = path.join(PROJECT_ROOT, 'messages');
const EN_FILE = path.join(MESSAGES_DIR, 'en.json');

// Locale display names
const LOCALE_NAMES = {
  'zh-Hans': '简体中文 (Simplified Chinese)',
  'zh-Hant': '繁體中文 (Traditional Chinese)',
  'ja': '日本語 (Japanese)',
  'ko': '한국어 (Korean)',
  'fr': 'Français (French)',
  'de': 'Deutsch (German)',
  'es': 'Español (Spanish)',
  'pt': 'Português (Portuguese)',
  'ru': 'Русский (Russian)',
};

/**
 * Recursively get all key-value pairs from nested object
 * @param {Object} obj - The object to traverse
 * @param {string} prefix - Current key path prefix
 * @returns {Array<{key: string, value: *}>} Array of key-value pairs
 */
function getAllEntries(obj, prefix = '') {
  const entries = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...getAllEntries(value, fullKey));
    } else {
      entries.push({ key: fullKey, value });
    }
  }

  return entries;
}

/**
 * Get value from nested object using dot notation
 * @param {Object} obj - The object to query
 * @param {string} path - Dot notation path
 * @returns {*} The value at the path
 */
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set value in nested object using dot notation
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 */
function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Check if a string contains English characters
 * Simple heuristic: if it contains Latin alphabet, assume English
 * @param {string} text - Text to check
 * @returns {boolean} True if likely English
 */
function isLikelyEnglish(text) {
  if (typeof text !== 'string') return false;
  // Check if contains English letters (excluding URLs, placeholders)
  const cleanText = text.replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/\{[^}]+\}/g, '') // Remove {placeholders}
    .replace(/\$\{[^}]+\}/g, ''); // Remove ${variables}

  // If after cleaning, contains English letters, it's likely English
  return /[a-zA-Z]{2,}/.test(cleanText);
}

/**
 * Find entries that need translation
 * @param {Object} enData - English reference data
 * @param {Object} targetData - Target language data
 * @returns {Array<{key: string, enValue: string}>} Entries needing translation
 */
function findTranslationNeeded(enData, targetData) {
  const enEntries = getAllEntries(enData);
  const needsTranslation = [];

  for (const { key, value: enValue } of enEntries) {
    const targetValue = getValueByPath(targetData, key);

    // Need translation if:
    // 1. Value is missing in target
    // 2. Value in target is same as English (not translated yet)
    // 3. Value in target still contains significant English text
    if (!targetValue || targetValue === enValue || isLikelyEnglish(targetValue)) {
      needsTranslation.push({ key, enValue });
    }
  }

  return needsTranslation;
}

/**
 * Display translation instructions for Claude Code
 * @param {string} locale - Target locale
 * @param {Array} entries - Entries to translate
 */
function displayTranslationTask(locale, entries) {
  const localeName = LOCALE_NAMES[locale] || locale;

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.magenta}📝 Translation Task${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.blue}Target Language:${colors.reset} ${localeName}`);
  console.log(`${colors.blue}Entries to translate:${colors.reset} ${entries.length}\n`);

  console.log(`${colors.yellow}⚠ Translation Guidelines:${colors.reset}`);
  console.log(`  1. Preserve brand names: "AI Coding Stack", "Claude Code", etc.`);
  console.log(`  2. Keep placeholders intact: {count}, {name}, \${variable}`);
  console.log(`  3. Don't translate URLs and file paths`);
  console.log(`  4. Maintain consistent terminology throughout\n`);

  console.log(`${colors.green}Content to translate:${colors.reset}\n`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Group entries by top-level section for better context
  const sections = {};
  for (const { key, enValue } of entries) {
    const section = key.split('.')[0];
    if (!sections[section]) sections[section] = [];
    sections[section].push({ key, enValue });
  }

  console.log('```json');
  const translationMap = {};
  for (const { key, enValue } of entries) {
    translationMap[key] = enValue;
  }
  console.log(JSON.stringify(translationMap, null, 2));
  console.log('```\n');

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.yellow}👉 Next Steps:${colors.reset}`);
  console.log(`  1. Copy the JSON above`);
  console.log(`  2. Translate each value to ${localeName}`);
  console.log(`  3. Reply with the translated JSON`);
  console.log(`  4. The script will automatically update ${locale}.json\n`);
}

/**
 * Apply translations to target file
 * @param {string} targetFile - Target language file path
 * @param {Object} translations - Translation map {key: translatedValue}
 * @returns {number} Number of translations applied
 */
function applyTranslations(targetFile, translations) {
  const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
  let count = 0;

  for (const [key, value] of Object.entries(translations)) {
    setValueByPath(targetData, key, value);
    count++;
  }

  // Write back with consistent formatting
  fs.writeFileSync(targetFile, JSON.stringify(targetData, null, 2) + '\n', 'utf-8');

  return count;
}

/**
 * Main translate function
 */
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const locale = args[0];

  if (!locale) {
    console.error(`${colors.red}✗ Usage: node translate.mjs <locale>${colors.reset}`);
    console.error(`${colors.yellow}  Example: node translate.mjs zh-Hans${colors.reset}\n`);
    console.error(`${colors.blue}Available locales:${colors.reset}`);
    for (const [code, name] of Object.entries(LOCALE_NAMES)) {
      console.error(`  ${code} - ${name}`);
    }
    process.exit(1);
  }

  const targetFile = path.join(MESSAGES_DIR, `${locale}.json`);

  console.log(`${colors.cyan}🌐 Translation Assistant for ${locale}${colors.reset}\n`);

  // Check files exist
  if (!fs.existsSync(EN_FILE)) {
    console.error(`${colors.red}✗ English reference file not found: ${EN_FILE}${colors.reset}`);
    process.exit(1);
  }

  if (!fs.existsSync(targetFile)) {
    console.error(`${colors.red}✗ Target language file not found: ${targetFile}${colors.reset}`);
    console.error(`${colors.yellow}💡 Tip: Run sync first to create the file${colors.reset}`);
    process.exit(1);
  }

  // Load data
  const enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));
  const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));

  // Find entries needing translation
  const toTranslate = findTranslationNeeded(enData, targetData);

  if (toTranslate.length === 0) {
    console.log(`${colors.green}✓ All entries in ${locale}.json are already translated!${colors.reset}`);
    return;
  }

  // Display translation task for Claude Code
  displayTranslationTask(locale, toTranslate);
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
}
