import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import StackSidebar from '@/components/sidebar/StackSidebar'
import type { Locale } from '@/i18n/config'
import { vendorsData } from '@/lib/generated'
import { localizeManifestItems } from '@/lib/manifest-i18n'
import { generateListPageMetadata } from '@/lib/metadata'
import type { ManifestVendor } from '@/types/manifests'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'vendors',
    translationNamespace: 'stacksPages.vendors',
    additionalKeywords: [
      'LLM vendors',
      'Google',
      'Microsoft',
      'AI companies',
      'foundation model providers',
    ],
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function VendorsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'stacksPages.vendors' })
  const vendors = vendorsData as unknown as ManifestVendor[]
  const localizedVendors = localizeManifestItems(
    vendors as unknown as Record<string, unknown>[],
    locale as Locale
  ) as unknown as typeof vendors

  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <StackSidebar activeStack="vendors" locale={locale} />

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-[var(--spacing-lg)]">
              <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
                <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">
                  {'//'}
                </span>
                {t('title')}
              </h1>
              <p className="text-base text-[var(--color-text-secondary)] font-light">
                {t('subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
              {localizedVendors.map(vendor => (
                <Link
                  key={vendor.id}
                  href={`/${locale}/vendors/${vendor.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                    <h3 className="text-lg font-semibold tracking-tight">{vendor.name}</h3>
                    <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">
                    {vendor.description}
                  </p>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  )
}
