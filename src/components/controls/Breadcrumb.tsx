import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

/**
 * Renders a breadcrumb navigation bar and injects a Schema.org BreadcrumbList via JsonLd.
 * - Visual trail is rendered from provided items; the last item is shown as plain text.
 * - Structured data includes an optional "Home" at the first position for better SEO.
 */
export function Breadcrumb({
  items,
  siteOrigin = 'https://aicodingstack.io',
  includeHome = true,
}: {
  items: BreadcrumbItem[];
  siteOrigin?: string;
  includeHome?: boolean;
}) {
  const schemaItems = [
    ...(includeHome
      ? [{
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${siteOrigin}`,
        }]
      : []),
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: (includeHome ? 2 : 1) + index,
      name: item.name,
      item: `${siteOrigin}${item.href}`,
    })),
  ];

  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  } as const;

  return (
    <>
      <JsonLd data={breadcrumbListSchema} />
      <section className="py-[var(--spacing-sm)] bg-[var(--color-hover)] border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-[var(--spacing-md)]">
          <nav className="flex items-center gap-[var(--spacing-xs)] text-[0.8125rem]">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <span key={`${item.href}-${index}`} className="inline-flex items-center gap-[var(--spacing-xs)]">
                  {isLast ? (
                    <span className="text-[var(--color-text)] font-medium">{item.name}</span>
                  ) : (
                    <Link href={item.href} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                      {item.name}
                    </Link>
                  )}
                  {!isLast && <span className="text-[var(--color-text-muted)]">/</span>}
                </span>
              );
            })}
          </nav>
        </div>
      </section>
    </>
  );
}


