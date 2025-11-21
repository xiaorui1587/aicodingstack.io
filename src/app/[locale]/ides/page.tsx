import { generateListPageMetadata } from '@/lib/metadata'
import IDEsPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'ides',
    translationNamespace: 'stacksPages.ides',
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function IDEsPage({ params }: Props) {
  const { locale } = await params
  return <IDEsPageClient locale={locale} />
}
