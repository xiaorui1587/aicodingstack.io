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
import type { ManifestCLI, ManifestPricingTier, ComponentResourceUrls, ComponentCommunityUrls } from '@/types/manifests';
import { clisData as clis } from '@/lib/generated';

export const revalidate = 3600;

export async function generateStaticParams() {
  return clis.map((cli) => ({
    slug: cli.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const cliRaw = clis.find((c) => c.id === slug);

  if (!cliRaw) {
    return { title: 'CLI Not Found | AI Coding Stack' };
  }

  const cli = localizeManifestItem(cliRaw, locale as Locale) as ManifestCLI;
  const t = await getTranslations({ locale });

  const licenseStr = cli.license ? translateLicenseText(cli.license, t) : '';

  return await generateSoftwareDetailMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'clis',
    slug,
    product: {
      name: cli.name,
      description: cli.description,
      vendor: cli.vendor,
      platforms: cli.platforms,
      pricing: cli.pricing,
      license: licenseStr,
    },
    typeDescription: 'AI Coding Assistant CLI',
  });
}

export default async function CLIPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const cliRaw = clis.find((c) => c.id === slug) as ManifestCLI | undefined;

  if (!cliRaw) {
    notFound();
  }

  const cli = localizeManifestItem(cliRaw as unknown as Record<string, unknown>, locale as Locale) as unknown as ManifestCLI;
  const t = await getTranslations({ locale });
  const tHero = await getTranslations({ locale, namespace: 'components.productHero' });
  const tNav = await getTranslations({ locale, namespace: 'stacksPages.clis' });
  const tStacks = await getTranslations({ locale, namespace: 'stacks' });

  const websiteUrl = cli.resourceUrls?.download || cli.websiteUrl;
  const docsUrl = cli.docsUrl;

  // Transform resourceUrls to component format (convert null to undefined)
  const resourceUrls: ComponentResourceUrls = {
    download: cli.resourceUrls?.download || undefined,
    changelog: cli.resourceUrls?.changelog || undefined,
    pricing: cli.resourceUrls?.pricing || undefined,
    mcp: cli.resourceUrls?.mcp || undefined,
    issue: cli.resourceUrls?.issue || undefined,
  };

  // Transform communityUrls to component format (convert null to undefined)
  const communityUrls: ComponentCommunityUrls = {
    linkedin: cli.communityUrls?.linkedin || undefined,
    twitter: cli.communityUrls?.twitter || undefined,
    github: cli.communityUrls?.github || undefined,
    youtube: cli.communityUrls?.youtube || undefined,
    discord: cli.communityUrls?.discord || undefined,
    reddit: cli.communityUrls?.reddit || undefined,
  };

  // Schema.org structured data
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": cli.name,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": cli.platforms?.map(p => p.os).join(', ') || "Windows, macOS, Linux",
    "softwareVersion": cli.latestVersion,
    "description": cli.description,
    "url": websiteUrl,
    "downloadUrl": cli.resourceUrls?.download,
    "installUrl": cli.resourceUrls?.download,
    "author": {
      "@type": "Organization",
      "name": cli.vendor
    },
    "offers": cli.pricing ? cli.pricing.map((tier: ManifestPricingTier) => {
      return {
        "@type": "Offer",
        "name": tier.name,
        "price": getSchemaPrice(tier),
        "priceCurrency": getSchemaCurrency(tier),
        "category": tier.category
      };
    }) : undefined,
    "license": cli.license ? translateLicenseText(cli.license, t) : undefined,
  };

  return (
    <>
      <JsonLd data={softwareApplicationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tStacks('aiCodingStack'), href: '/ai-coding-stack' },
          { name: tStacks('clis'), href: 'clis' },
          { name: cli.name, href: `clis/${cli.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={cli.name}
        description={cli.description}
        vendor={cli.vendor}
        category="CLI"
        categoryLabel={tHero('categories.CLI')}
        latestVersion={cli.latestVersion}
        license={cli.license}
        githubStars={cli.githubStars as number | null | undefined}
        platforms={cli.platforms?.map(p => p.os)}
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        downloadUrl={cli.resourceUrls?.download || undefined}
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

      {/* Related IDE */}
      {cli.ide && (
        <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
          <div className="max-w-[800px] mx-auto px-[var(--spacing-md)]">
            <Link
              href={`ides/${cli.ide}`}
              className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-[var(--spacing-sm)]">
                <div className="flex items-center gap-[var(--spacing-sm)]">
                  <pre className="text-xs leading-tight text-[var(--color-text-muted)]">
{`┌─────┐
│ IDE │
└─────┘`}
                  </pre>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
                      Related IDE
                    </p>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {cli.ide.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h3>
                  </div>
                </div>
                <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] font-light">
                IDE companion for {cli.name}
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Pricing */}
      <ProductPricing
        pricing={cli.pricing}
        pricingUrl={resourceUrls.pricing}
      />

      {/* Additional Links */}
      <ProductLinks
        resourceUrls={resourceUrls}
        communityUrls={communityUrls}
      />

      {/* Commands */}
      <ProductCommands
        install={cli.install}
        launch={cli.launch}
      />

      {/* Navigation */}
      <BackToNavigation href="clis" title={tNav('allCLIs')} />

      <Footer />
    </>
  );
}
