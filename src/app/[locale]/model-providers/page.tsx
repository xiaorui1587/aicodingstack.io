import { generateListPageMetadata } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StackSidebar from '@/components/sidebar/StackSidebar';
import { localizeManifestItems } from '@/lib/manifest-i18n';
import type { Locale } from '@/i18n/config';
import type { ManifestProvider } from '@/types/manifests';
import { providersData } from '@/lib/generated';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return await generateListPageMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'modelProviders',
    translationNamespace: 'stacksPages.modelProviders',
    additionalKeywords: ['OpenAI', 'Anthropic', 'model API', 'AI provider comparison'],
  });
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ModelProvidersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stacksPages.modelProviders' });
  const providers = providersData as unknown as ManifestProvider[];
  const localizedProviders = localizeManifestItems(providers as unknown as Record<string, unknown>[], locale as Locale) as unknown as typeof providers;
  const foundationModelProviders = localizedProviders.filter((p) => p.type === 'foundation-model-provider');
  const modelServiceProviders = localizedProviders.filter((p) => p.type === 'model-service-provider');

  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <StackSidebar activeStack="model-providers" locale={locale} />

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-[var(--spacing-lg)]">
              <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
                <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">{'//'}</span>
                {t('title')}
              </h1>
              <p className="text-base text-[var(--color-text-secondary)] font-light">
                {t('subtitle')}
              </p>
            </div>

            <section className="mb-[var(--spacing-lg)]">
              <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">{t('foundationProviders')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
                {foundationModelProviders.map((provider) => (
                  <Link
                    key={provider.name}
                    href={`/${locale}/model-providers/${provider.id}`}
                    className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                  >
                    <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                      <h3 className="text-lg font-semibold tracking-tight">{provider.name}</h3>
                      <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">→</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">{provider.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">{t('serviceProviders')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
                {modelServiceProviders.map((provider) => (
                  <Link
                    key={provider.name}
                    href={`/${locale}/model-providers/${provider.id}`}
                    className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                  >
                    <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                      <h3 className="text-lg font-semibold tracking-tight">{provider.name}</h3>
                      <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">→</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">{provider.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
