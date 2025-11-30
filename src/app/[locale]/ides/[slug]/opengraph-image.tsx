import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import type { Locale } from '@/i18n/config'
import { getIDE } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params
  const ide = await getIDE(slug, locale as Locale)

  if (!ide) {
    return new ImageResponse(
      <OGImageTemplate
        category="AI-POWERED IDE"
        title="AI Coding Stack"
        description="Discover the best AI coding tools and IDEs for developers"
      />,
      { ...size }
    )
  }

  return new ImageResponse(
    <OGImageTemplate
      category="AI-POWERED IDE"
      title={ide.name}
      description={ide.description}
      vendor={ide.vendor}
    />,
    { ...size }
  )
}
