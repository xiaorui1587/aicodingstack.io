import { notFound } from 'next/navigation';
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
import type { ManifestExtension } from '@/types/manifests';
import { extensionsData as extensions } from '@/lib/generated';
import { getGithubStars } from '@/lib/generated/github-stars';

export const revalidate = 3600;

export async function generateStaticParams() {
  return extensions.map((extension) => ({
    slug: extension.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const extensionRaw = extensions.find((e) => e.id === slug);

  if (!extensionRaw) {
    return { title: 'Extension Not Found | AI Coding Stack' };
  }

  const extension = localizeManifestItem(extensionRaw as unknown as Record<string, unknown>, locale as Locale) as unknown as ManifestExtension;
  const t = await getTranslations({ locale });

  const licenseStr = extension.license ? translateLicenseText(extension.license, t) : '';
  const platforms = extension.supportedIdes?.map(ideSupport => ({ os: ideSupport.ideId }));

  return await generateSoftwareDetailMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'extensions',
    slug,
    product: {
      name: extension.name,
      description: extension.description,
      vendor: extension.vendor,
      platforms,
      pricing: extension.pricing,
      license: licenseStr,
    },
    typeDescription: 'AI Coding Extension',
  });
}

export default async function ExtensionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const extensionRaw = extensions.find((e) => e.id === slug) as ManifestExtension | undefined;

  if (!extensionRaw) {
    notFound();
  }

  // Apply localization
  const extension = localizeManifestItem(extensionRaw as unknown as Record<string, unknown>, locale as Locale) as unknown as ManifestExtension;
  const t = await getTranslations({ locale });
  const tHero = await getTranslations({ locale, namespace: 'components.productHero' });
  const tNav = await getTranslations({ locale, namespace: 'stacksPages.extensions' });
  const tStacks = await getTranslations({ locale, namespace: 'stacks' });

  const websiteUrl = extension.resourceUrls?.download || extension.websiteUrl;
  const docsUrl = extension.docsUrl;

  // Schema.org structured data
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": extension.name,
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "AI Assistant",
    "operatingSystem": "Cross-platform",
    "compatibleWith": extension.supportedIdes?.map(ideSupport => ideSupport.ideId).join(', ') || "VS Code, JetBrains IDEs",
    "softwareVersion": extension.latestVersion,
    "description": extension.description,
    "url": websiteUrl,
    "downloadUrl": extension.resourceUrls?.download || extension.supportedIdes?.[0]?.marketplaceUrl || undefined,
    "installUrl": extension.resourceUrls?.download || extension.supportedIdes?.[0]?.marketplaceUrl || undefined,
    "author": {
      "@type": "Organization",
      "name": extension.vendor
    },
    "offers": extension.pricing && extension.pricing.length > 0 ? extension.pricing.map(tier => {
      return {
        "@type": "Offer",
        "name": tier.name,
        "price": getSchemaPrice(tier),
        "priceCurrency": getSchemaCurrency(tier),
        "category": tier.category
      };
    }) : {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "license": extension.license ? translateLicenseText(extension.license, t) : undefined,
  };

  return (
    <>
      <JsonLd data={softwareApplicationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tStacks('aiCodingStack'), href: '/ai-coding-stack' },
          { name: tStacks('extensions'), href: 'extensions' },
          { name: extension.name, href: `extensions/${extension.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={extension.name}
        description={extension.description}
        vendor={extension.vendor}
        category="IDE"
        categoryLabel={tHero('categories.EXTENSION')}
        latestVersion={extension.latestVersion}
        license={extension.license}
        githubStars={getGithubStars('extensions', extension.id)}
        additionalInfo={extension.supportedIdes && extension.supportedIdes.length > 0 ? [{
          label: tHero('supportedIdes'),
          value: extension.supportedIdes.map(ideSupport => ideSupport.ideId).join(', ')
        }] : undefined}
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        downloadUrl={extension.resourceUrls?.download || extension.supportedIdes?.[0]?.marketplaceUrl || undefined}
        labels={{
          vendor: tHero('vendor'),
          version: tHero('version'),
          license: tHero('license'),
          stars: tHero('stars'),
          visitWebsite: tHero('visitWebsite'),
          documentation: tHero('documentation'),
          download: tHero('download'),
        }}
      />

      {/* Pricing */}
      <ProductPricing
        pricing={extension.pricing}
        pricingUrl={extension.resourceUrls?.pricing || undefined}
      />

      {/* Additional Links */}
      <ProductLinks
        resourceUrls={{}}
        communityUrls={{}}
      />

      {/* Commands */}
      <ProductCommands
        install={extension.supportedIdes?.[0]?.installCommand || extension.install || undefined}
        launch={extension.launch || undefined}
      />

      {/* Navigation */}
      <BackToNavigation href="extensions" title={tNav('allExtensions')} />

      <Footer />
    </>
  );
}
