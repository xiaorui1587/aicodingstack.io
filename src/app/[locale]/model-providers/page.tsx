import { generateListPageMetadata } from '@/lib/metadata'
import ModelProvidersPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'modelProviders',
    translationNamespace: 'stacksPages.modelProviders',
    additionalKeywords: ['OpenAI', 'Anthropic', 'model API', 'AI provider comparison'],
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ModelProvidersPage({ params }: Props) {
  const { locale } = await params
  return <ModelProvidersPageClient locale={locale} />
}
