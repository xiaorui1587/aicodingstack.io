import { generateComparisonMetadata } from '@/lib/metadata'
import CLIComparisonPageClient from './page.client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  return await generateComparisonMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'clis',
  })
}

export default async function CLIComparisonPage({ params }: Props) {
  const { locale } = await params
  return <CLIComparisonPageClient locale={locale} />
}
