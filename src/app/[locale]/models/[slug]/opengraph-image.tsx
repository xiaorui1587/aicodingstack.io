import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import { getModel } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const model = await getModel(slug)

  if (!model) {
    return new ImageResponse(
      <OGImageTemplate
        category="AI MODEL"
        title="AI Coding Stack"
        description="Discover the best AI models for coding"
      />,
      { ...size }
    )
  }

  return new ImageResponse(
    <OGImageTemplate
      category="AI MODEL"
      title={model.name}
      description={model.description || `${model.name} by ${model.vendor}`}
      vendor={model.vendor}
    />,
    { ...size }
  )
}
