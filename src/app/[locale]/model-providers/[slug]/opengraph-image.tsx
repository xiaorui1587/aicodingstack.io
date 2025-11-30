import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import type { Locale } from '@/i18n/config'
import { getModelProvider } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params
  const provider = await getModelProvider(slug, locale as Locale)

  if (!provider) {
    return new ImageResponse(
      <OGImageTemplate
        category="AI MODEL PROVIDER"
        title="AI Coding Stack"
        description="Discover leading AI model providers and platforms"
      />,
      { ...size }
    )
  }

  return new ImageResponse(
    <OGImageTemplate
      category="AI MODEL PROVIDER"
      title={provider.name}
      description={provider.description}
    />,
    { ...size }
  )
}
