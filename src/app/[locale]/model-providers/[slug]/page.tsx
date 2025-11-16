import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BackToNavigation } from '@/components/controls/BackToNavigation';
import { Breadcrumb } from '@/components/controls/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { ProductHero, LinkCardGrid } from '@/components/product';
import { localizeManifestItem } from '@/lib/manifest-i18n';
import { generateSoftwareDetailMetadata } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';
import type { ManifestProvider } from '@/types/manifests';
import { providersData as providers } from '@/lib/generated';

export const revalidate = 3600;

export async function generateStaticParams() {
  return providers.map((provider) => ({
    slug: provider.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const providerRaw = providers.find((p) => p.id === slug);

  if (!providerRaw) {
    return { title: 'Provider Not Found | AI Coding Stack' };
  }

  const provider = localizeManifestItem(providerRaw as unknown as Record<string, unknown>, locale as Locale) as unknown as ManifestProvider;

  return await generateSoftwareDetailMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'modelProviders',
    slug,
    product: {
      name: provider.name,
      description: provider.description,
      vendor: provider.name,
    },
    typeDescription: 'AI Model Provider',
  });
}

export default async function ProviderPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const providerRaw = providers.find((p) => p.id === slug) as unknown as ManifestProvider | undefined;

  if (!providerRaw) {
    notFound();
  }

  const provider = localizeManifestItem(providerRaw as unknown as Record<string, unknown>, locale as Locale) as unknown as ManifestProvider;
  const t = await getTranslations('stackDetailPages.modelProviderDetail');
  const tStacks = await getTranslations({ locale, namespace: 'stacks' });
  const tHero = await getTranslations({ locale, namespace: 'components.productHero' });

  const websiteUrl = provider.websiteUrl;
  const docsUrl = provider.docsUrl;

  // Configuration for AI platform links
  const AI_PLATFORM_LINKS = [
    { key: 'huggingface', title: t('aiPlatforms.huggingface.title'), description: t('aiPlatforms.huggingface.description') },
    { key: 'artificialAnalysis', title: t('aiPlatforms.artificialAnalysis.title'), description: t('aiPlatforms.artificialAnalysis.description') },
    { key: 'openrouter', title: t('aiPlatforms.openrouter.title'), description: t('aiPlatforms.openrouter.description') },
  ];

  // Configuration for community links
  const COMMUNITY_LINKS = [
    { key: 'linkedin', title: t('community.linkedin.title'), description: t('community.linkedin.description') },
    { key: 'twitter', title: t('community.twitter.title'), description: t('community.twitter.description') },
    { key: 'github', title: t('community.github.title'), description: t('community.github.description') },
    { key: 'youtube', title: t('community.youtube.title'), description: t('community.youtube.description') },
    { key: 'discord', title: t('community.discord.title'), description: t('community.discord.description') },
    { key: 'reddit', title: t('community.reddit.title'), description: t('community.reddit.description') },
  ];

  // Schema.org structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": provider.name,
    "description": provider.description,
    "url": provider.websiteUrl,
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tStacks('aiCodingStack'), href: '/ai-coding-stack' },
          { name: tStacks('modelProviders'), href: 'model-providers' },
          { name: provider.name, href: `model-providers/${provider.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={provider.name}
        description={provider.description}
        category="PROVIDER"
        categoryLabel={tHero('categories.PROVIDER')}
        type={provider.type}
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        applyKeyUrl={provider.applyKeyUrl}
        labels={{
          type: tHero('type'),
          typeValue: provider.type ? tHero(`providerTypes.${provider.type}`) : undefined,
          visitWebsite: tHero('visitWebsite'),
          documentation: tHero('documentation'),
          getApiKey: tHero('getApiKey'),
        }}
      />

      {/* Find on AI Platforms */}
      <LinkCardGrid
        title={t('findOnAiPlatforms')}
        links={AI_PLATFORM_LINKS}
        urls={provider.platformUrls || {}}
        layout="horizontal"
        gridCols="grid-cols-1 md:grid-cols-3"
      />

      {/* Community Links */}
      <LinkCardGrid
        title={t('communityLinks')}
        links={COMMUNITY_LINKS}
        urls={provider.communityUrls || {}}
        layout="vertical"
        gridCols="grid-cols-2 md:grid-cols-4"
      />

      {/* Navigation */}
      <BackToNavigation href="model-providers" title={t('allModelProviders')} />

      <Footer />
    </>
  );
}
