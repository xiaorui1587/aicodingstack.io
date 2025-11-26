import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Link } from '@/i18n/navigation'
import { buildCanonicalUrl, buildOpenGraph, buildTitle, buildTwitterCard } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'stacksPages.overview' })

  const canonicalPath = locale === 'en' ? '/ai-coding-stack' : `/${locale}/ai-coding-stack`
  const title = buildTitle({ title: t('title') })
  const description = t('subtitle')

  return {
    title,
    description,
    keywords:
      'AI Coding Stack, AI development tools, AI IDE, AI CLI, LLM models, AI coding ecosystem',
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/ai-coding-stack',
        'zh-Hans': '/zh-Hans/ai-coding-stack',
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

export default async function AICodingStackPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'stacksPages.overview' })

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <main>
          {/* Hero Section */}
          <section className="mb-[var(--spacing-xl)]">
            <h1 className="text-[3rem] font-bold tracking-[-0.04em] leading-[1.1] mb-[var(--spacing-md)]">
              {t('title')}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
              {t('subtitle')}
            </p>
          </section>

          {/* Stacks Grid Section */}
          <section className="mb-[var(--spacing-xl)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-md)]">
              {[
                { key: 'ides', path: 'ides' },
                { key: 'clis', path: 'clis' },
                { key: 'extensions', path: 'extensions' },
                { key: 'models', path: 'models' },
                { key: 'modelProviders', path: 'model-providers' },
                { key: 'vendors', path: 'vendors' },
              ].map(stack => (
                <Link
                  key={stack.key}
                  href={`/${stack.path}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-md)]">
                    <h3 className="text-[1.5rem] font-semibold tracking-tight">
                      {t(`${stack.key}.title`)}
                    </h3>
                    <span className="text-2xl text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light">
                    {t(`${stack.key}.description`)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  )
}
