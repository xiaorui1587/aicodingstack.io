import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import type { Locale } from '@/i18n/config'
import { getVendor } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params
  const vendor = await getVendor(slug, locale as Locale)

  if (!vendor) {
    return new ImageResponse(
      <OGImageTemplate
        category="AI TECHNOLOGY COMPANY"
        title="AI Coding Stack"
        description="Discover leading AI technology companies and vendors"
      />,
      { ...size }
    )
  }

  return new ImageResponse(
    <OGImageTemplate
      category="AI TECHNOLOGY COMPANY"
      title={vendor.name}
      description={vendor.description}
    />,
    { ...size }
  )
}
