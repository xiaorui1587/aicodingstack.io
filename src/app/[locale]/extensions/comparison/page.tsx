import type { Locale } from '@/i18n/config'
import { generateComparisonMetadata } from '@/lib/metadata'
import ExtensionComparisonPageClient from './page.client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  return await generateComparisonMetadata({
    locale: locale as Locale,
    category: 'extensions',
  })
}

export default async function ExtensionComparisonPage({ params }: Props) {
  const { locale } = await params
  return <ExtensionComparisonPageClient locale={locale} />
}
