import type { Locale } from '@/i18n/config'
import { generateComparisonMetadata } from '@/lib/metadata'
import ModelComparisonPageClient from './page.client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  return await generateComparisonMetadata({
    locale: locale as Locale,
    category: 'models',
  })
}

export default async function ModelComparisonPage({ params }: Props) {
  const { locale } = await params
  return <ModelComparisonPageClient locale={locale} />
}
