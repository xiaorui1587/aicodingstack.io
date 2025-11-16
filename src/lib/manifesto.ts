import React from 'react';

// MDX components mapping for manifesto content by locale
const manifestoComponents: Record<string, React.ComponentType> = {
  'en': require('@content/manifesto/en/index.mdx').default,
  'zh-Hans': require('@content/manifesto/zh-Hans/index.mdx').default,
};

// Get manifesto component for a specific locale with fallback to English
export function getManifestoComponent(locale: string = 'en'): React.ComponentType {
  return manifestoComponents[locale] || manifestoComponents['en'];
}
