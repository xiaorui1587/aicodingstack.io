import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { buildAlternates, buildOpenGraph, buildTitle, buildTwitterCard } from '@/lib/metadata'
import { OpenSourceRankPage } from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'components.openSourceRank.meta' })

  const title = buildTitle({ title: t('title') })
  const description = t('description')
  const basePath = 'open-source-rank'

  // Build alternates using helper function
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build canonical path for OpenGraph
  const canonicalPath = locale === 'en' ? `/${basePath}` : `/${locale}/${basePath}`

  return {
    title,
    description,
    alternates,
    openGraph: buildOpenGraph({
      title: t('title'),
      description,
      url: canonicalPath,
      locale,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      title: t('title'),
      description,
    }),
  }
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'components.openSourceRank' })

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
          <div className="mb-[var(--spacing-lg)]">
            <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
              <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">
                {'//'}
              </span>
              {t('title')}
            </h1>
            <p className="text-base leading-[1.8] text-[var(--color-text-secondary)] font-light">
              {t('description')}
            </p>
          </div>

          <OpenSourceRankPage />
        </div>
      </main>
      <Footer />
    </>
  )
}
