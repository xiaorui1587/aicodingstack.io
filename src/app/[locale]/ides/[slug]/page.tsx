import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BackToNavigation } from '@/components/controls/BackToNavigation';
import { Breadcrumb } from '@/components/controls/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { ProductHero, ProductPricing, ProductLinks, ProductCommands } from '@/components/product';
import { getSchemaPrice, getSchemaCurrency } from '@/lib/pricing';
import { localizeManifestItem } from '@/lib/manifest-i18n';
import { translateLicenseText } from '@/lib/license';
import { generateSoftwareDetailMetadata } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';
import type { ManifestIDE, ManifestPricingTier, ComponentResourceUrls, ComponentCommunityUrls } from '@/types/manifests';
import { idesData as ides } from '@/lib/generated';
import { getGithubStars } from '@/lib/generated/github-stars';

export const revalidate = 3600;

export async function generateStaticParams() {
  return ides.map((ide) => ({
    slug: ide.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const ideRaw = ides.find((i) => i.id === slug);

  if (!ideRaw) {
    return { title: 'IDE Not Found | AI Coding Stack' };
  }

  const ide = localizeManifestItem(ideRaw as unknown as Record<string, unknown>, locale as Locale) as unknown as ManifestIDE;
  const t = await getTranslations({ locale });

  const licenseStr = ide.license ? translateLicenseText(ide.license, t) : '';

  return await generateSoftwareDetailMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'ides',
    slug,
    product: {
      name: ide.name,
      description: ide.description,
      vendor: ide.vendor,
      platforms: ide.platforms,
      pricing: ide.pricing,
      license: licenseStr,
    },
    typeDescription: 'AI-Powered IDE for Developers',
  });
}

export default async function IDEPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const ideRaw = ides.find((i) => i.id === slug) as ManifestIDE | undefined;

  if (!ideRaw) {
    notFound();
  }

  const ide = localizeManifestItem(ideRaw as unknown as Record<string, unknown>, locale as Locale) as unknown as ManifestIDE;
  const t = await getTranslations({ locale });
  const tHero = await getTranslations({ locale, namespace: 'components.productHero' });
  const tNav = await getTranslations({ locale, namespace: 'stacksPages.ides' });
  const tStacks = await getTranslations({ locale, namespace: 'stacks' });

  const websiteUrl = ide.resourceUrls?.download || ide.websiteUrl;
  const docsUrl = ide.docsUrl;

  // Transform resourceUrls to component format (convert null to undefined)
  const resourceUrls: ComponentResourceUrls = {
    download: ide.resourceUrls?.download || undefined,
    changelog: ide.resourceUrls?.changelog || undefined,
    pricing: ide.resourceUrls?.pricing || undefined,
    mcp: ide.resourceUrls?.mcp || undefined,
    issue: ide.resourceUrls?.issue || undefined,
  };

  // Transform communityUrls to component format (convert null to undefined)
  const communityUrls: ComponentCommunityUrls = {
    linkedin: ide.communityUrls?.linkedin || undefined,
    twitter: ide.communityUrls?.twitter || undefined,
    github: ide.communityUrls?.github || undefined,
    youtube: ide.communityUrls?.youtube || undefined,
    discord: ide.communityUrls?.discord || undefined,
    reddit: ide.communityUrls?.reddit || undefined,
  };

  // Schema.org structured data
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": ide.name,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": ide.platforms?.map(p => p.os).join(', ') || "Windows, macOS, Linux",
    "softwareVersion": ide.latestVersion,
    "description": ide.description,
    "url": websiteUrl,
    "downloadUrl": ide.resourceUrls?.download,
    "installUrl": ide.resourceUrls?.download,
    "author": {
      "@type": "Organization",
      "name": ide.vendor
    },
    "offers": ide.pricing ? ide.pricing.map((tier: ManifestPricingTier) => {
      return {
        "@type": "Offer",
        "name": tier.name,
        "price": getSchemaPrice(tier),
        "priceCurrency": getSchemaCurrency(tier),
        "category": tier.category
      };
    }) : undefined,
    "license": (ide as unknown as ManifestIDE).license ? translateLicenseText((ide as unknown as ManifestIDE).license, t) : undefined,
  };

  // Breadcrumb is now rendered by shared component and structured data injected there

  return (
    <>
      <JsonLd data={softwareApplicationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tStacks('aiCodingStack'), href: '/ai-coding-stack' },
          { name: tStacks('ides'), href: 'ides' },
          { name: ide.name, href: `ides/${ide.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={ide.name}
        description={ide.description}
        vendor={ide.vendor}
        category="IDE"
        categoryLabel={tHero('categories.IDE')}
        latestVersion={ide.latestVersion}
        license={ide.license}
        githubStars={getGithubStars('ides', ide.id)}
        platforms={ide.platforms?.map(p => p.os)}
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        downloadUrl={ide.resourceUrls?.download || undefined}
        labels={{
          vendor: tHero('vendor'),
          version: tHero('version'),
          license: tHero('license'),
          stars: tHero('stars'),
          platforms: tHero('platforms'),
          visitWebsite: tHero('visitWebsite'),
          documentation: tHero('documentation'),
          download: tHero('download'),
        }}
      />

      {/* Related CLI Tool */}
      {ide.cli && (
        <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
          <div className="max-w-[800px] mx-auto px-[var(--spacing-md)]">
            <Link
              href={`clis/${ide.cli}`}
              className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-[var(--spacing-sm)]">
                <div className="flex items-center gap-[var(--spacing-sm)]">
                  <pre className="text-xs leading-tight text-[var(--color-text-muted)]">
{`┌─────┐
│ CLI │
└─────┘`}
                  </pre>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
                      Related CLI Tool
                    </p>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {ide.cli.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h3>
                  </div>
                </div>
                <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] font-light">
                Command-line interface companion for {ide.name}
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Pricing */}
      <ProductPricing
        pricing={ide.pricing}
        pricingUrl={ide.resourceUrls?.pricing || undefined}
      />

      {/* Additional Links */}
      <ProductLinks
        resourceUrls={resourceUrls}
        communityUrls={communityUrls}
      />

      {/* Commands */}
      <ProductCommands
        install={ide.install}
        launch={ide.launch}
      />

      {/* Navigation */}
      <BackToNavigation href="ides" title={tNav('allIDEs')} />

      <Footer />
    </>
  );
}
