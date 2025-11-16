#!/usr/bin/env node

/**
 * Build script to extract MDX metadata at build time
 * This eliminates runtime fs calls, making it compatible with Cloudflare Edge
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function getMDXFiles(directory) {
  return fs.readdirSync(directory).filter(file => file.endsWith('.mdx'));
}

function parseMDXFrontmatter(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);
  return data;
}

function getSlugFromFilename(fileName) {
  return fileName.replace(/\.mdx$/, '');
}

function extractH1FromMDX(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

// Parse FAQ sections from a unified index.mdx file
// Each H1 heading becomes a FAQ item with its title and content
function parseFaqSections(content) {
  // Remove frontmatter if present
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

  // Split content by H1 headings (# Title)
  const sections = [];
  const h1Regex = /^# (.+)$/gm;
  let match;
  let lastIndex = 0;
  const matches = [];

  // Find all H1 headings and their positions
  while ((match = h1Regex.exec(withoutFrontmatter)) !== null) {
    matches.push({
      title: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  // Extract content for each section
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];

    // Content is everything after the H1 until the next H1 (or end of file)
    const contentStart = currentMatch.endIndex;
    const contentEnd = nextMatch ? nextMatch.startIndex : withoutFrontmatter.length;
    const content = withoutFrontmatter.slice(contentStart, contentEnd).trim();

    sections.push({
      title: currentMatch.title,
      content: content
    });
  }

  return sections;
}

// Generate articles metadata for a specific locale
function generateArticlesMetadataForLocale(locale) {
  const articlesDirectory = path.join(rootDir, `content/articles/${locale}`);

  // Return empty array if locale directory doesn't exist
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const fileNames = getMDXFiles(articlesDirectory);

  const articles = fileNames.map(fileName => {
    const slug = getSlugFromFilename(fileName);
    const fullPath = path.join(articlesDirectory, fileName);
    const frontmatter = parseMDXFrontmatter(fullPath);

    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
    };
  });

  // Sort articles by date (newest first)
  return articles.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

// Generate articles metadata for all locales
function generateArticlesMetadata() {
  const SUPPORTED_LOCALES = ['en', 'zh-Hans'];
  const articlesMetadata = {};

  for (const locale of SUPPORTED_LOCALES) {
    articlesMetadata[locale] = generateArticlesMetadataForLocale(locale);
  }

  return articlesMetadata;
}

// Generate docs metadata for a specific locale
function generateDocsMetadataForLocale(locale) {
  const docsDirectory = path.join(rootDir, `content/docs/${locale}`);

  // Return empty array if locale directory doesn't exist
  if (!fs.existsSync(docsDirectory)) {
    return [];
  }

  const fileNames = getMDXFiles(docsDirectory);

  const docs = fileNames.map(fileName => {
    const slug = getSlugFromFilename(fileName);
    const fullPath = path.join(docsDirectory, fileName);
    const frontmatter = parseMDXFrontmatter(fullPath);

    return {
      id: slug,
      slug,
      title: frontmatter.title,
    };
  });

  // Sort docs by slug (alphabetically)
  return docs.sort((a, b) => a.slug.localeCompare(b.slug));
}

// Generate docs metadata for all locales
function generateDocsMetadata() {
  const SUPPORTED_LOCALES = ['en', 'zh-Hans'];
  const docsMetadata = {};

  for (const locale of SUPPORTED_LOCALES) {
    docsMetadata[locale] = generateDocsMetadataForLocale(locale);
  }

  return docsMetadata;
}

// Generate collections metadata from JSON file
function generateCollectionsMetadata() {
  const collectionsFile = path.join(rootDir, 'manifests/collections.json');

  if (!fs.existsSync(collectionsFile)) {
    console.warn('⚠️  Collections file not found, skipping...');
    return {};
  }

  const fileContents = fs.readFileSync(collectionsFile, 'utf8');
  return JSON.parse(fileContents);
}

// Generate FAQ metadata for a specific locale
function generateFaqMetadataForLocale(locale) {
  const faqIndexPath = path.join(rootDir, `content/faq/${locale}/index.mdx`);

  // Return empty array if index file doesn't exist
  if (!fs.existsSync(faqIndexPath)) {
    console.warn(`⚠️  FAQ index file not found: ${faqIndexPath}`);
    return [];
  }

  const fileContents = fs.readFileSync(faqIndexPath, 'utf8');
  const faqSections = parseFaqSections(fileContents);

  return faqSections;
}

// Generate FAQ metadata for all locales
function generateFaqMetadata() {
  const SUPPORTED_LOCALES = ['en', 'zh-Hans'];
  const faqMetadata = {};

  for (const locale of SUPPORTED_LOCALES) {
    faqMetadata[locale] = generateFaqMetadataForLocale(locale);
  }

  return faqMetadata;
}

// Generate stack counts from manifest files
function generateStackCounts() {
  // Directories containing individual JSON files (new structure)
  const manifestDirectories = {
    ides: 'ides',
    clis: 'clis',
    extensions: 'extensions',
    models: 'models',
    'model-providers': 'providers',
    vendors: 'vendors',
  };

  // Single files (old structure)
  const singleFiles = {};

  const stackCounts = {};

  // Count files in directories
  for (const [stackId, dirName] of Object.entries(manifestDirectories)) {
    const manifestDir = path.join(rootDir, 'manifests', dirName);

    if (!fs.existsSync(manifestDir)) {
      console.warn(`⚠️  Manifest directory not found: ${manifestDir}`);
      stackCounts[stackId] = 0;
      continue;
    }

    try {
      const files = fs.readdirSync(manifestDir).filter(file => file.endsWith('.json'));
      stackCounts[stackId] = files.length;
    } catch (error) {
      console.error(`❌ Error reading directory ${dirName}:`, error.message);
      stackCounts[stackId] = 0;
    }
  }

  // Count items in single files
  for (const [stackId, fileName] of Object.entries(singleFiles)) {
    const manifestPath = path.join(rootDir, 'manifests', fileName);

    if (!fs.existsSync(manifestPath)) {
      console.warn(`⚠️  Manifest file not found: ${manifestPath}`);
      stackCounts[stackId] = 0;
      continue;
    }

    try {
      const fileContents = fs.readFileSync(manifestPath, 'utf8');
      const manifestData = JSON.parse(fileContents);
      stackCounts[stackId] = Array.isArray(manifestData) ? manifestData.length : 0;
    } catch (error) {
      console.error(`❌ Error reading ${fileName}:`, error.message);
      stackCounts[stackId] = 0;
    }
  }

  return stackCounts;
}

// Main execution
function main() {
  console.log('Generating MDX metadata...');

  const articles = generateArticlesMetadata();
  const docs = generateDocsMetadata();
  const collections = generateCollectionsMetadata();
  const faqs = generateFaqMetadata();
  const stackCounts = generateStackCounts();

  // Write metadata to TypeScript file
  const outputDir = path.join(rootDir, 'src/lib/generated');
  const outputFile = path.join(outputDir, 'metadata.ts');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const content = `// This file is auto-generated by scripts/generate-metadata.mjs
// DO NOT EDIT MANUALLY

import type { ArticleMetadata } from '../articles';
import type { DocSection } from '../docs';
import type { CollectionSection } from '../collections';
import type { FaqItem } from '../faq';

export const articlesMetadata: Record<string, ArticleMetadata[]> = ${JSON.stringify(articles, null, 2)};

export const docsMetadata: Record<string, DocSection[]> = ${JSON.stringify(docs, null, 2)};

export const collectionsMetadata: Record<string, CollectionSection> = ${JSON.stringify(collections, null, 2)};

export const faqMetadata: Record<string, FaqItem[]> = ${JSON.stringify(faqs, null, 2)};

export const stackCounts: Record<string, number> = ${JSON.stringify(stackCounts, null, 2)};
`;

  fs.writeFileSync(outputFile, content, 'utf8');

  // Calculate total docs, articles, and faqs across all locales
  const totalDocs = Object.values(docs).reduce((sum, localeDocs) => sum + localeDocs.length, 0);
  const totalArticles = Object.values(articles).reduce((sum, localeArticles) => sum + localeArticles.length, 0);
  const totalFaqs = Object.values(faqs).reduce((sum, localeFaqs) => sum + localeFaqs.length, 0);
  const docsLocalesCounts = Object.entries(docs).map(([locale, localeDocs]) => `${locale}: ${localeDocs.length}`).join(', ');
  const articlesLocalesCounts = Object.entries(articles).map(([locale, localeArticles]) => `${locale}: ${localeArticles.length}`).join(', ');
  const faqsLocalesCounts = Object.entries(faqs).map(([locale, localeFaqs]) => `${locale}: ${localeFaqs.length}`).join(', ');
  const collectionsLocales = Object.keys(collections).join(', ');
  const stackCountsSummary = Object.entries(stackCounts).map(([stack, count]) => `${stack}: ${count}`).join(', ');

  console.log(`✅ Generated metadata for ${totalArticles} articles (${articlesLocalesCounts}), ${totalDocs} docs (${docsLocalesCounts}), ${totalFaqs} faqs (${faqsLocalesCounts}), and collections (${collectionsLocales})`);
  console.log(`✅ Generated stack counts: ${stackCountsSummary}`);
  console.log(`📝 Output: ${outputFile}`);
}

main();
