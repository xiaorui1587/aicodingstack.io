import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BackToNavigation } from '@/components/controls/BackToNavigation';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, buildTitle } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'header' });

  const canonicalPath = locale === 'en' ? '/ai-coding-landscape' : `/${locale}/ai-coding-landscape`;
  const title = buildTitle({ title: tNav('aiCodingLandscape') });
  const description = tNav('aiCodingLandscapeDesc');

  return {
    title,
    description,
    keywords: 'AI coding ecosystem, AI development landscape, AI tools, coding tools visualization',
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
  };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LandscapePage({ params }: Props) {
  const { locale } = await params;
  const tStacks = await getTranslations({ locale, namespace: 'stacks' });
  const tNav = await getTranslations({ locale, namespace: 'header' });
  const tOverview = await getTranslations({ locale, namespace: 'stacksPages.overview' });

  const categories = [
    {
      title: tNav('developmentTools'),
      items: [
        { name: tStacks('ides'), href: 'ides', icon: '📝', color: 'from-blue-500/20 to-purple-500/20' },
        { name: tStacks('clis'), href: 'clis', icon: '💻', color: 'from-green-500/20 to-emerald-500/20' },
        { name: tStacks('extensions'), href: 'extensions', icon: '🔌', color: 'from-pink-500/20 to-rose-500/20' }
      ]
    },
    {
      title: tNav('intelligence'),
      items: [
        { name: tStacks('models'), href: 'models', icon: '🤖', color: 'from-purple-500/20 to-indigo-500/20' },
        { name: tStacks('modelProviders'), href: 'model-providers', icon: '🔑', color: 'from-indigo-500/20 to-violet-500/20' }
      ]
    }
  ];

  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
        {/* Page Header */}
        <div className="text-center mb-[var(--spacing-xl)]">
          <h1 className="text-[3rem] font-semibold tracking-[-0.04em] mb-[var(--spacing-sm)]">
            <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">🗺️</span>
            {tNav('aiCodingLandscape')}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] font-light max-w-[800px] mx-auto">
            {tNav('aiCodingLandscapeDesc')}
          </p>
        </div>

        {/* Landscape Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-lg)] mb-[var(--spacing-xl)]">
          {categories.map((category, idx) => (
            <div key={idx} className="space-y-[var(--spacing-md)]">
              <h2 className="text-xl font-semibold tracking-tight">
                <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">{'//'}</span>
                {category.title}
              </h2>
              <div className="grid gap-[var(--spacing-md)]">
                {category.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block p-[var(--spacing-lg)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:-translate-y-1 transition-all group bg-gradient-to-br ${item.color}`}
                  >
                    <div className="flex items-start gap-[var(--spacing-md)]">
                      <span className="text-4xl">{item.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold tracking-tight mb-[var(--spacing-xs)] group-hover:text-[var(--color-text)] transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vendors Section */}
        <div className="border-t border-[var(--color-border)] pt-[var(--spacing-xl)]">
          <Link
            href="vendors"
            className="block p-[var(--spacing-xl)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:-translate-y-1 transition-all group bg-gradient-to-br from-slate-500/10 to-gray-500/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[var(--spacing-md)]">
                <span className="text-4xl">🏢</span>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-[var(--spacing-xs)] group-hover:text-[var(--color-text)] transition-colors">
                    {tStacks('vendors')}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] font-light">
                    Leading companies and organizations building AI technologies
                  </p>
                </div>
              </div>
              <span className="text-2xl text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-2 transition-all">
                →
              </span>
            </div>
          </Link>
        </div>

        {/* Back to Overview */}
        <div className="mt-[var(--spacing-xl)]">
          <BackToNavigation 
            href="/ai-coding-stack" 
            title={tOverview('overviewTitle')} 
          />
        </div>
      </div>

      <Footer />
    </>
  );
}
