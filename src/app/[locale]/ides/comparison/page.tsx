import type { Locale } from '@/i18n/config'
import { generateComparisonMetadata } from '@/lib/metadata'
import IDEComparisonPageClient from './page.client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  return await generateComparisonMetadata({
    locale: locale as Locale,
    category: 'ides',
  })
}

export default async function IDEComparisonPage({ params }: Props) {
  const { locale } = await params
  return <IDEComparisonPageClient locale={locale} />
}
