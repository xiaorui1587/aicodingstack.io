import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import type { Locale } from '@/i18n/config'
import { getCLI } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params
  const cli = await getCLI(slug, locale as Locale)

  if (!cli) {
    return new ImageResponse(
      <OGImageTemplate
        category="AI CODING ASSISTANT CLI"
        title="AI Coding Stack"
        description="Discover the best AI coding CLI tools for developers"
      />,
      { ...size }
    )
  }

  return new ImageResponse(
    <OGImageTemplate
      category="AI CODING ASSISTANT CLI"
      title={cli.name}
      description={cli.description}
      vendor={cli.vendor}
    />,
    { ...size }
  )
}
