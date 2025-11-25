import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Link } from '@/i18n/navigation'
import { getManifestoComponent } from '@/lib/manifesto'
import { buildCanonicalUrl, buildOpenGraph, buildTitle, buildTwitterCard } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.manifesto' })

  const canonicalPath = locale === 'en' ? '/manifesto' : `/${locale}/manifesto`
  const title = buildTitle({ title: t('title') })
  const description = t('subtitle')

  return {
    title,
    description,
    keywords: 'AI Coding Manifesto, AI development philosophy, AI coding principles',
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/manifesto',
        'zh-Hans': '/zh-Hans/manifesto',
      },
    },
    openGraph: buildOpenGraph({
      title: t('title'),
      description,
      url: buildCanonicalUrl({ path: canonicalPath, locale }),
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

export default async function ManifestoPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.manifesto' })
  const tStack = await getTranslations({ locale, namespace: 'stacksPages.overview' })
  const ManifestoContent = await getManifestoComponent(locale)

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <main>
          {/* Hero Section */}
          <section className="mb-[var(--spacing-2xl)]">
            <div className="space-y-[var(--spacing-md)]">
              <h1 className="text-[2.5rem] md:text-[2rem] font-bold tracking-[-0.03em] leading-[1.15]">
                {t('title')}
              </h1>
              <div className="bg-[var(--color-hover)] p-[var(--spacing-md)]">
                <div className="text-[1.5rem] md:text-[1.25rem] tracking-[-0.01em] font-semibold text-[var(--color-text-secondary)]">
                  {t('slogan')}
                </div>
              </div>
            </div>
          </section>

          {/* Manifesto Content */}
          <section className="prose prose-neutral dark:prose-invert max-w-none mb-[var(--spacing-xl)]">
            <ManifestoContent />
          </section>

          {/* Explore AI Coding Stack Link */}
          <section className="mb-[var(--spacing-xl)]">
            <Link
              href="/ai-coding-stack"
              className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em] mb-[var(--spacing-xs)]">
                    {tStack('title')}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{tStack('subtitle')}</p>
                </div>
                <span className="text-4xl text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-2 transition-all">
                  →
                </span>
              </div>
            </Link>
          </section>
        </main>
      </div>

      <Footer />
    </>
  )
}
