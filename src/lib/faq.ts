import { faqMetadata } from './generated/metadata';

export type FaqItem = {
  title: string;
  content: string;
};

// Get FAQ items for a specific locale with fallback to English
export function getFaqItems(locale: string): FaqItem[] {
  return faqMetadata[locale] || faqMetadata['en'] || [];
}
