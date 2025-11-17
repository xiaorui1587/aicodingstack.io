'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StackSidebar from '@/components/sidebar/StackSidebar';
import FilterSortBar from '@/components/controls/FilterSortBar';
import { localizeManifestItems } from '@/lib/manifest-i18n';
import { translateLicenseText } from '@/lib/license';
import type { Locale } from '@/i18n/config';
import { extensionsData } from '@/lib/generated';

type Props = {
  locale: string;
};

export default function ExtensionsPageClient({ locale }: Props) {
  const t = useTranslations('stacksPages.extensions');
  const tGlobal = useTranslations();
  const [sortOrder, setSortOrder] = useState<'default' | 'name-asc' | 'name-desc'>('default');
  const [licenseFilters, setLicenseFilters] = useState<string[]>([]);
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);

  // Localize Extensions
  const localizedExtensions = useMemo(() => {
    return localizeManifestItems(extensionsData as unknown as Record<string, unknown>[], locale as Locale) as unknown as typeof extensionsData;
  }, [locale]);

  // Filter and sort Extensions
  const filteredAndSortedExtensions = useMemo(() => {
    let result = [...localizedExtensions];

    // Apply license filter
    if (licenseFilters.length > 0) {
      result = result.filter(extension => {
        const isOpenSource = extension.license !== 'Proprietary';
        const isProprietary = extension.license === 'Proprietary';

        if (licenseFilters.includes('open-source') && isOpenSource) {
          return true;
        }
        if (licenseFilters.includes('proprietary') && isProprietary) {
          return true;
        }
        return false;
      });
    }

    // Apply platform filter (IDE platform for extensions)
    if (platformFilters.length > 0) {
      result = result.filter(extension => {
        const ideList = extension.supportedIdes?.map(ideSupport => ideSupport.ideId) || [];
        return platformFilters.some(ide => ideList.includes(ide));
      });
    }

    // Apply sorting
    if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    // 'default' keeps the original order

    return result;
  }, [localizedExtensions, sortOrder, licenseFilters, platformFilters]);

  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <StackSidebar activeStack="extensions" locale={locale} />

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-[var(--spacing-lg)]">
              <div className="flex items-start justify-between mb-[var(--spacing-sm)]">
                <h1 className="text-[2rem] font-semibold tracking-[-0.03em]">
                  <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">{'//'}</span>
                  {t('title')}
                </h1>
                <Link
                  href={`/${locale}/extensions/comparison`}
                  className="text-sm px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
                >
                  {t('compareAll')} →
                </Link>
              </div>
              <p className="text-base text-[var(--color-text-secondary)] font-light">
                {t('subtitle')}
              </p>
            </div>

            <FilterSortBar
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              licenseFilters={licenseFilters}
              onLicenseFiltersChange={setLicenseFilters}
              platformFilters={platformFilters}
              onPlatformFiltersChange={setPlatformFilters}
              availablePlatforms={['vscode', 'jetbrains', 'cursor', 'windsurf']}
              platformLabel="IDE:"
            />

            {filteredAndSortedExtensions.length === 0 ? (
              <div className="text-center py-[var(--spacing-xl)] text-[var(--color-text-secondary)]">
                {t('noMatches')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
                {filteredAndSortedExtensions.map((extension) => (
                  <Link
                    key={extension.name}
                    href={`/${locale}/extensions/${extension.id}`}
                    className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                      <h3 className="text-lg font-semibold tracking-tight">{extension.name}</h3>
                      <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                        →
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mb-[var(--spacing-md)] font-light min-h-[4rem]">
                      {extension.description}
                    </p>
                    <div className="flex items-center gap-[var(--spacing-xs)] text-xs text-[var(--color-text-muted)] mt-auto">
                      <span>{extension.vendor}</span>
                      {extension.license && (
                        <>
                          <span className="text-[var(--color-border)]">•</span>
                          <span>{translateLicenseText(extension.license, tGlobal)}</span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
