import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { buildVendorMatrix } from '@/lib/landscape-data'
import { buildCanonicalUrl, buildOpenGraph, buildTitle, buildTwitterCard } from '@/lib/metadata'
import VendorMatrix from './components/VendorMatrix'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tNav = await getTranslations({ locale, namespace: 'header' })

  const canonicalPath = locale === 'en' ? '/ai-coding-landscape' : `/${locale}/ai-coding-landscape`
  const title = buildTitle({ title: tNav('aiCodingLandscape') })
  const description = tNav('aiCodingLandscapeDesc')

  return {
    title,
    description,
    keywords:
      'AI coding ecosystem, AI development landscape, AI tools, coding tools visualization, vendor comparison, product matrix',
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/ai-coding-landscape',
        'zh-Hans': '/zh-Hans/ai-coding-landscape',
      },
    },
    openGraph: buildOpenGraph({
      title: tNav('aiCodingLandscape'),
      description,
      url: buildCanonicalUrl({ path: canonicalPath, locale }),
      locale,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      title: tNav('aiCodingLandscape'),
      description,
    }),
  }
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  const tNav = await getTranslations({ locale, namespace: 'header' })
  const tOverview = await getTranslations({ locale, namespace: 'stacksPages.overview' })

  // Build vendor matrix data
  const matrixData = buildVendorMatrix()

  return (
    <>
      <Header />
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Page Header */}
        <div className="mb-[var(--spacing-lg)]">
          <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {tNav('aiCodingLandscape')}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] font-light">
            {tNav('aiCodingLandscapeDesc')}
          </p>
        </div>

        {/* Vendor Matrix */}
        <VendorMatrix matrixData={matrixData} locale={locale} />

        {/* Back to Overview */}
        <div className="mt-[var(--spacing-xl)]">
          <BackToNavigation href="/ai-coding-stack" title={tOverview('overviewTitle')} />
        </div>
      </div>
      <Footer />
    </>
  )
}
