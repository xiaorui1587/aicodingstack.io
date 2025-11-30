import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { ProductCommands, ProductHero, ProductLinks, ProductPricing } from '@/components/product'
import type { Locale } from '@/i18n/config'
import { getExtension } from '@/lib/data/fetchers'
import { extensionsData as extensions } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { getSchemaCurrency, getSchemaPrice } from '@/lib/pricing'

export const revalidate = 3600

export async function generateStaticParams() {
  return extensions.map(extension => ({
    slug: extension.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const extension = await getExtension(slug, locale as Locale)

  if (!extension) {
    return { title: 'Extension Not Found | AI Coding Stack' }
  }

  const t = await getTranslations({ locale })
  const licenseStr = extension.license ? translateLicenseText(extension.license, t) : ''
  const platforms = extension.supportedIdes?.map(ideSupport => ({ os: ideSupport.ideId }))

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
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
  })
}

export default async function ExtensionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const extension = await getExtension(slug, locale as Locale)

  if (!extension) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.extensionDetail' })
  const tGlobal = await getTranslations({ locale })

  const websiteUrl = extension.resourceUrls?.download || extension.websiteUrl
  const docsUrl = extension.docsUrl

  // Schema.org structured data
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: extension.name,
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'AI Assistant',
    operatingSystem: 'Cross-platform',
    compatibleWith:
      extension.supportedIdes?.map(ideSupport => ideSupport.ideId).join(', ') ||
      'VS Code, JetBrains IDEs',
    softwareVersion: extension.latestVersion,
    description: extension.description,
    url: websiteUrl,
    downloadUrl:
      extension.resourceUrls?.download || extension.supportedIdes?.[0]?.marketplaceUrl || undefined,
    installUrl:
      extension.resourceUrls?.download || extension.supportedIdes?.[0]?.marketplaceUrl || undefined,
    author: {
      '@type': 'Organization',
      name: extension.vendor,
    },
    offers:
      extension.pricing && extension.pricing.length > 0
        ? extension.pricing.map(tier => {
            return {
              '@type': 'Offer',
              name: tier.name,
              price: getSchemaPrice(tier),
              priceCurrency: getSchemaCurrency(tier),
              category: tier.category,
            }
          })
        : {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
    license: extension.license ? translateLicenseText(extension.license, tGlobal) : undefined,
  }

  return (
    <>
      <JsonLd data={softwareApplicationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tGlobal('shared.stacks.extensions'), href: 'extensions' },
          { name: extension.name, href: `extensions/${extension.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={extension.name}
        description={extension.description}
        vendor={extension.vendor}
        category="IDE"
        categoryLabel={t('categoryLabel')}
        latestVersion={extension.latestVersion}
        license={extension.license}
        githubStars={getGithubStars('extensions', extension.id)}
        additionalInfo={
          extension.supportedIdes && extension.supportedIdes.length > 0
            ? [
                {
                  label: t('supportedIdes'),
                  value: extension.supportedIdes.map(ideSupport => ideSupport.ideId).join(', '),
                },
              ]
            : undefined
        }
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        downloadUrl={
          extension.resourceUrls?.download ||
          extension.supportedIdes?.[0]?.marketplaceUrl ||
          undefined
        }
        labels={{
          vendor: t('vendor'),
          version: t('version'),
          license: t('license'),
          stars: t('stars'),
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
          download: t('download'),
        }}
      />

      {/* Pricing */}
      <ProductPricing
        pricing={extension.pricing}
        pricingUrl={extension.resourceUrls?.pricing || undefined}
      />

      {/* Additional Links */}
      <ProductLinks resourceUrls={{}} communityUrls={{}} />

      {/* Commands */}
      <ProductCommands
        install={extension.supportedIdes?.[0]?.installCommand || extension.install || undefined}
        launch={extension.launch || undefined}
      />

      {/* Navigation */}
      <BackToNavigation href="extensions" title={t('allExtensions')} />

      <Footer />
    </>
  )
}
