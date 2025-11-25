import { getTranslations } from 'next-intl/server'
import CollectionScrollbar from '@/components/CollectionScrollbar'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { getCollections } from '@/lib/collections'
import { buildCanonicalUrl, buildOpenGraph, buildTitle, buildTwitterCard } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.curatedCollections' })

  const canonicalPath = locale === 'en' ? '/curated-collections' : `/${locale}/curated-collections`
  const title = buildTitle({ title: `${t('title')} - AI Coding Specs, Protocols & Tools` })
  const description = t('subtitle')

  return {
    title,
    description,
    keywords:
      'AI coding resources, MCP protocol, Agent2Agent, development standards, AI coding articles, semantic versioning, conventional commits',
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/curated-collections',
        'zh-Hans': '/zh-Hans/curated-collections',
      },
    },
    openGraph: buildOpenGraph({
      title: `${t('title')} - AI Coding Specs, Protocols & Tools`,
      description,
      url: buildCanonicalUrl({ path: canonicalPath, locale }),
      locale,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      title: `${t('title')} - AI Coding Specs, Protocols & Tools`,
      description,
    }),
  }
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CuratedCollectionsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.curatedCollections' })
  const collections = getCollections(locale)

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Page Header */}
        <div className="text-center mb-[var(--spacing-xl)]">
          <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {t('title')}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] font-light">{t('subtitle')}</p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-[var(--spacing-lg)]">
          <CollectionScrollbar />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Specifications & Protocols Section */}
            <section id="specifications" className="mb-[var(--spacing-xl)] scroll-mt-[100px]">
              <div className="mb-[var(--spacing-lg)] border-l-2 border-[var(--color-border-strong)] pl-[var(--spacing-md)]">
                <h2 className="text-lg font-medium tracking-tight mb-[var(--spacing-xs)] text-[var(--color-text)]">
                  {collections.specifications.title}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] font-light">
                  {collections.specifications.description}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-md)]">
                {collections.specifications.cards.map(card => (
                  <div
                    key={card.title}
                    className="border border-[var(--color-border)] p-[var(--spacing-md)]"
                  >
                    <h3 className="text-lg font-semibold tracking-tight mb-[var(--spacing-md)]">
                      {card.title}
                    </h3>
                    <ul className="space-y-[var(--spacing-md)]">
                      {card.items.map(item => (
                        <li key={item.url}>
                          <a href={item.url} target="_blank" rel="noopener" className="group block">
                            <div className="text-base font-medium text-[var(--color-text)] group-hover:underline">
                              {item.name}
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] font-light mt-[var(--spacing-xs)]">
                              {item.description}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Articles Section */}
            <section id="articles" className="mb-[var(--spacing-xl)] scroll-mt-[100px]">
              <div className="mb-[var(--spacing-lg)] border-l-2 border-[var(--color-border-strong)] pl-[var(--spacing-md)]">
                <h2 className="text-lg font-medium tracking-tight mb-[var(--spacing-xs)] text-[var(--color-text)]">
                  {collections.articles.title}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] font-light">
                  {collections.articles.description}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-md)]">
                {collections.articles.cards.map(card => (
                  <div
                    key={card.title}
                    className="border border-[var(--color-border)] p-[var(--spacing-md)]"
                  >
                    <h3 className="text-lg font-semibold tracking-tight mb-[var(--spacing-md)]">
                      {card.title}
                    </h3>
                    <ul className="space-y-[var(--spacing-md)]">
                      {card.items.map(item => (
                        <li key={item.url}>
                          <a href={item.url} target="_blank" rel="noopener" className="group block">
                            <div className="text-base font-medium text-[var(--color-text)] group-hover:underline">
                              {item.name}
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] font-light mt-[var(--spacing-xs)]">
                              {item.description}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Ecosystem Tools Section */}
            <section id="tools" className="scroll-mt-[100px]">
              <div className="mb-[var(--spacing-lg)] border-l-2 border-[var(--color-border-strong)] pl-[var(--spacing-md)]">
                <h2 className="text-lg font-medium tracking-tight mb-[var(--spacing-xs)] text-[var(--color-text)]">
                  {collections.tools.title}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] font-light">
                  {collections.tools.description}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-md)]">
                {collections.tools.cards.map(card => (
                  <div
                    key={card.title}
                    className="border border-[var(--color-border)] p-[var(--spacing-md)]"
                  >
                    <h3 className="text-lg font-semibold tracking-tight mb-[var(--spacing-md)]">
                      {card.title}
                    </h3>
                    <ul className="space-y-[var(--spacing-md)]">
                      {card.items.map(item => (
                        <li key={item.url}>
                          <a href={item.url} target="_blank" rel="noopener" className="group block">
                            <div className="text-base font-medium text-[var(--color-text)] group-hover:underline">
                              {item.name}
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] font-light mt-[var(--spacing-xs)]">
                              {item.description}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
