import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import { getArticle } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params
  const article = await getArticle(slug, locale)

  if (!article) {
    return new ImageResponse(
      <OGImageTemplate
        category="ARTICLE"
        title="AI Coding Stack"
        description="Insights and guides for AI-powered development"
      />,
      { ...size }
    )
  }

  return new ImageResponse(
    <OGImageTemplate category="ARTICLE" title={article.title} description={article.description} />,
    { ...size }
  )
}
