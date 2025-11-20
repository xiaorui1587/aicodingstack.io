import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StackSidebar from '@/components/sidebar/StackSidebar';
import { getManifestoComponent } from '@/lib/manifesto';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, buildTitle } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stacksPages.overview' });

  const canonicalPath = locale === 'en' ? '/ai-coding-stack' : `/${locale}/ai-coding-stack`;
  const title = buildTitle({ title: t('title') });
  const description = t('subtitle');

  return {
    title,
    description,
    keywords: 'AI Coding Stack, AI development tools, AI IDE, AI CLI, LLM models, AI coding ecosystem',
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
  };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AICodingStackPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stacksPages.overview' });
  const ManifestoContent = await getManifestoComponent(locale);

  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <StackSidebar activeStack="overview" locale={locale} />

          <main className="flex-1">
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

            {/* Stacks Grid Section */}
            <section className="mb-[var(--spacing-xl)]">
              <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em] my-[var(--spacing-md)]">
                <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">{'//'}</span>
                {t('exploreStack')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)]">
                {[
                  { key: 'ides', path: 'ides' },
                  { key: 'clis', path: 'clis' },
                  { key: 'extensions', path: 'extensions' },
                  { key: 'models', path: 'models' },
                  { key: 'modelProviders', path: 'model-providers' },
                  { key: 'vendors', path: 'vendors' }
                ].map((stack) => (
                  <Link
                    key={stack.key}
                    href={`/${stack.path}`}
                    className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                  >
                    <div className="flex justify-between items-start mb-[var(--spacing-md)]">
                      <h3 className="text-[1.5rem] font-semibold tracking-tight">{t(`${stack.key}.title`)}</h3>
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

            {/* Manifesto Section */}
            <section className="prose prose-neutral dark:prose-invert max-w-none">
              <ManifestoContent />
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
