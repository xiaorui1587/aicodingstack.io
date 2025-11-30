import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import type { Locale } from '@/i18n/config'
import { getExtension } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params
  const extension = await getExtension(slug, locale as Locale)

  if (!extension) {
    return new ImageResponse(
      <OGImageTemplate
        category="AI CODING EXTENSION"
        title="AI Coding Stack"
        description="Discover the best AI coding extensions for your IDE"
      />,
      { ...size }
    )
  }

  return new ImageResponse(
    <OGImageTemplate
      category="AI CODING EXTENSION"
      title={extension.name}
      description={extension.description}
      vendor={extension.vendor}
    />,
    { ...size }
  )
}
