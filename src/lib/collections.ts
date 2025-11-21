import collectionsData from '@/../manifests/collections.json'
import type { Locale } from '@/i18n/config'
import { localizeManifestItem } from './manifest-i18n'

export interface CollectionItem {
  name: string
  url: string
  description: string
  i18n?: {
    [locale: string]: {
      name?: string
      description?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

export interface CollectionCard {
  title: string
  items: CollectionItem[]
  i18n?: {
    [locale: string]: {
      title?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

export interface CollectionSection {
  title: string
  description: string
  cards: CollectionCard[]
  i18n?: {
    [locale: string]: {
      title?: string
      description?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

export interface Collections {
  specifications: CollectionSection
  articles: CollectionSection
  tools: CollectionSection
}

// Localize a single collection item
function localizeCollectionItem(item: CollectionItem, locale: Locale): CollectionItem {
  return localizeManifestItem(item, locale, ['name', 'description'])
}

// Localize a collection card
function localizeCollectionCard(card: CollectionCard, locale: Locale): CollectionCard {
  return {
    ...localizeManifestItem(card, locale, ['title']),
    items: card.items.map(item => localizeCollectionItem(item, locale)),
  }
}

// Localize a collection section
function localizeCollectionSection(section: CollectionSection, locale: Locale): CollectionSection {
  return {
    ...localizeManifestItem(section, locale, ['title', 'description']),
    cards: section.cards.map(card => localizeCollectionCard(card, locale)),
  }
}

// Get collections for a specific locale with fallback to English
export function getCollections(locale: string): Collections {
  const typedLocale = locale as Locale

  return {
    specifications: localizeCollectionSection(
      collectionsData.specifications as CollectionSection,
      typedLocale
    ),
    articles: localizeCollectionSection(collectionsData.articles as CollectionSection, typedLocale),
    tools: localizeCollectionSection(collectionsData.tools as CollectionSection, typedLocale),
  }
}
