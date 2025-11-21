import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { LinkCardGrid, ProductHero } from '@/components/product'
import type { Locale } from '@/i18n/config'
import { vendorsData as vendors } from '@/lib/generated'
import { localizeManifestItem } from '@/lib/manifest-i18n'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import type { ManifestVendor } from '@/types/manifests'

export const revalidate = 3600

// Community link metadata for localization
const COMMUNITY_LINK_METADATA: Record<string, { titleKey: string; descriptionKey: string }> = {
  linkedin: { titleKey: 'linkedin', descriptionKey: 'connectLinkedIn' },
  twitter: { titleKey: 'twitter', descriptionKey: 'followTwitter' },
  github: { titleKey: 'github', descriptionKey: 'viewGitHub' },
  youtube: { titleKey: 'youtube', descriptionKey: 'watchYouTube' },
  discord: { titleKey: 'discord', descriptionKey: 'joinDiscord' },
  reddit: { titleKey: 'reddit', descriptionKey: 'joinReddit' },
}

export async function generateStaticParams() {
  return vendors.map(vendor => ({
    slug: vendor.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const vendorRaw = vendors.find(v => v.id === slug)

  if (!vendorRaw) {
    return { title: 'Vendor Not Found | AI Coding Stack' }
  }

  const vendor = localizeManifestItem(
    vendorRaw as unknown as Record<string, unknown>,
    locale as Locale
  ) as unknown as ManifestVendor

  return await generateSoftwareDetailMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'vendors',
    slug,
    product: {
      name: vendor.name,
      description: vendor.description,
      vendor: vendor.name,
    },
    typeDescription: 'AI Technology Company',
  })
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const vendorRaw = vendors.find(v => v.id === slug) as ManifestVendor | undefined
  const t = await getTranslations({ locale, namespace: 'stackDetailPages.vendorDetail' })
  const tStacks = await getTranslations({ locale, namespace: 'stacks' })
  const tHero = await getTranslations({ locale, namespace: 'components.productHero' })

  if (!vendorRaw) {
    notFound()
  }

  const vendor = localizeManifestItem(
    vendorRaw as unknown as Record<string, unknown>,
    locale as Locale
  ) as unknown as ManifestVendor

  const websiteUrl = vendor.websiteUrl

  // Schema.org structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: vendor.name,
    description: vendor.description,
    url: vendor.websiteUrl,
  }

  return (
    <>
      <JsonLd data={organizationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tStacks('aiCodingStack'), href: '/ai-coding-stack' },
          { name: tStacks('vendors'), href: 'vendors' },
          { name: vendor.name, href: `vendors/${vendor.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={vendor.name}
        description={vendor.description}
        category="VENDOR"
        categoryLabel={tHero('categories.VENDOR')}
        websiteUrl={websiteUrl}
      />

      {/* Community Links */}
      {vendor.communityUrls &&
        Object.entries(vendor.communityUrls).filter(([, url]) => url).length > 0 && (
          <LinkCardGrid
            title={t('communityLinks')}
            links={Object.entries(vendor.communityUrls)
              .filter(([, url]) => url)
              .map(([key]) => {
                const metadata = COMMUNITY_LINK_METADATA[key]
                return {
                  key,
                  title: metadata ? t(metadata.titleKey) : key,
                  description: metadata ? t(metadata.descriptionKey) : '',
                }
              })}
            urls={vendor.communityUrls}
            layout="vertical"
            gridCols="grid-cols-2 md:grid-cols-4"
          />
        )}

      {/* Navigation */}
      <BackToNavigation href="vendors" title={t('allVendors')} />

      <Footer />
    </>
  )
}
