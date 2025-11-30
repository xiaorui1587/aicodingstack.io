import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { ProductCommands, ProductHero, ProductLinks, ProductPricing } from '@/components/product'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { getIDE } from '@/lib/data/fetchers'
import { idesData as ides } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { getSchemaCurrency, getSchemaPrice } from '@/lib/pricing'
import type {
  ComponentCommunityUrls,
  ComponentResourceUrls,
  ManifestIDE,
  ManifestPricingTier,
} from '@/types/manifests'

export const revalidate = 3600

export async function generateStaticParams() {
  return ides.map(ide => ({
    slug: ide.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const ide = await getIDE(slug, locale as Locale)

  if (!ide) {
    return { title: 'IDE Not Found | AI Coding Stack' }
  }

  const tGlobal = await getTranslations({ locale })
  const licenseStr = ide.license ? translateLicenseText(ide.license, tGlobal) : ''

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
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
  })
}

export default async function IDEPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const ide = await getIDE(slug, locale as Locale)

  if (!ide) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.ideDetail' })
  const tGlobal = await getTranslations({ locale })

  const websiteUrl = ide.resourceUrls?.download || ide.websiteUrl
  const docsUrl = ide.docsUrl

  // Transform resourceUrls to component format (convert null to undefined)
  const resourceUrls: ComponentResourceUrls = {
    download: ide.resourceUrls?.download || undefined,
    changelog: ide.resourceUrls?.changelog || undefined,
    pricing: ide.resourceUrls?.pricing || undefined,
    mcp: ide.resourceUrls?.mcp || undefined,
    issue: ide.resourceUrls?.issue || undefined,
  }

  // Transform communityUrls to component format (convert null to undefined)
  const communityUrls: ComponentCommunityUrls = {
    linkedin: ide.communityUrls?.linkedin || undefined,
    twitter: ide.communityUrls?.twitter || undefined,
    github: ide.communityUrls?.github || undefined,
    youtube: ide.communityUrls?.youtube || undefined,
    discord: ide.communityUrls?.discord || undefined,
    reddit: ide.communityUrls?.reddit || undefined,
  }

  // Schema.org structured data
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: ide.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: ide.platforms?.map(p => p.os).join(', ') || 'Windows, macOS, Linux',
    softwareVersion: ide.latestVersion,
    description: ide.description,
    url: websiteUrl,
    downloadUrl: ide.resourceUrls?.download,
    installUrl: ide.resourceUrls?.download,
    author: {
      '@type': 'Organization',
      name: ide.vendor,
    },
    offers: ide.pricing
      ? ide.pricing.map((tier: ManifestPricingTier) => {
          return {
            '@type': 'Offer',
            name: tier.name,
            price: getSchemaPrice(tier),
            priceCurrency: getSchemaCurrency(tier),
            category: tier.category,
          }
        })
      : undefined,
    license: (ide as unknown as ManifestIDE).license
      ? translateLicenseText((ide as unknown as ManifestIDE).license, tGlobal)
      : undefined,
  }

  // Breadcrumb is now rendered by shared component and structured data injected there

  return (
    <>
      <JsonLd data={softwareApplicationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tGlobal('shared.stacks.ides'), href: 'ides' },
          { name: ide.name, href: `ides/${ide.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={ide.name}
        description={ide.description}
        vendor={ide.vendor}
        category="IDE"
        categoryLabel={t('categoryLabel')}
        latestVersion={ide.latestVersion}
        license={ide.license}
        githubStars={getGithubStars('ides', ide.id)}
        platforms={ide.platforms?.map(p => p.os)}
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        downloadUrl={ide.resourceUrls?.download || undefined}
        labels={{
          vendor: t('vendor'),
          version: t('version'),
          license: t('license'),
          stars: t('stars'),
          platforms: t('platforms'),
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
          download: t('download'),
        }}
      />

      {/* Related CLI Tool */}
      {ide.cli && (
        <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
          <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
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
                      {ide.cli
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
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
      <ProductPricing pricing={ide.pricing} pricingUrl={ide.resourceUrls?.pricing || undefined} />

      {/* Additional Links */}
      <ProductLinks resourceUrls={resourceUrls} communityUrls={communityUrls} />

      {/* Commands */}
      <ProductCommands install={ide.install} launch={ide.launch} />

      {/* Navigation */}
      <BackToNavigation href="ides" title={t('allIDEs')} />

      <Footer />
    </>
  )
}
