import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import StackSidebar from '@/components/sidebar/StackSidebar'
import { modelsData } from '@/lib/generated'
import { generateListPageMetadata } from '@/lib/metadata'
import type { ManifestModel } from '@/types/manifests'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'models',
    translationNamespace: 'stacksPages.models',
    additionalKeywords: ['LLM for coding', 'Claude Sonnet', 'GPT-4', 'coding AI models 2025'],
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ModelsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'stacksPages.models' })
  const models = modelsData as unknown as ManifestModel[]
  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <StackSidebar activeStack="models" locale={locale} />

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-[var(--spacing-lg)]">
              <div className="flex items-start justify-between mb-[var(--spacing-sm)]">
                <h1 className="text-[2rem] font-semibold tracking-[-0.03em]">
                  <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">
                    {'//'}
                  </span>
                  {t('title')}
                </h1>
                <Link
                  href={`/${locale}/models/comparison`}
                  className="text-sm px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
                >
                  {t('compareAll')} →
                </Link>
              </div>
              <p className="text-base text-[var(--color-text-secondary)] font-light">
                {t('subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
              {models.map(model => (
                <Link
                  key={model.name}
                  href={`/${locale}/models/${model.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                    <h3 className="text-lg font-semibold tracking-tight">{model.name}</h3>
                    <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                  <div className="space-y-[var(--spacing-xs)] mb-[var(--spacing-md)]">
                    <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                      <span className="text-[var(--color-text-muted)]">{t('size')}</span>
                      <span className="text-[var(--color-text-secondary)]">{model.size}</span>
                    </div>
                    <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                      <span className="text-[var(--color-text-muted)]">{t('context')}</span>
                      <span className="text-[var(--color-text-secondary)]">
                        {model.totalContext}
                      </span>
                    </div>
                    <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                      <span className="text-[var(--color-text-muted)]">{t('pricing')}</span>
                      <span className="text-[var(--color-text-secondary)]">
                        {model.tokenPricing?.input !== null &&
                        model.tokenPricing?.input !== undefined
                          ? `$${model.tokenPricing.input}/M`
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[var(--spacing-xs)] text-xs text-[var(--color-text-muted)]">
                    <span>{model.vendor}</span>
                  </div>
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
