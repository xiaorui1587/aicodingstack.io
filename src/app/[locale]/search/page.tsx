import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { buildOpenGraph, buildTitle, buildTwitterCard, SITE_CONFIG } from '@/lib/metadata'
import SearchPageClient from './page.client'

export const revalidate = 3600

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params
  const { q } = await searchParams
  const t = await getTranslations({ locale, namespace: 'components.search' })

  const title = q ? t('resultsCountFor', { count: 0, query: q }) : t('title')
  const description = t('placeholder')
  const searchUrl = `/${locale}/search${q ? `?q=${encodeURIComponent(q)}` : ''}`

  return {
    title: buildTitle({ title }),
    description,
    openGraph: buildOpenGraph({
      title: buildTitle({ title }),
      description,
      url: searchUrl,
      locale: locale as Locale | 'de',
    }),
    twitter: buildTwitterCard({
      title: buildTitle({ title }),
      description,
    }),
    alternates: {
      canonical: `${SITE_CONFIG.url}${searchUrl}`,
      languages: {
        en: `${SITE_CONFIG.url}/en/search${q ? `?q=${encodeURIComponent(q)}` : ''}`,
        'zh-Hans': `${SITE_CONFIG.url}/zh-Hans/search${q ? `?q=${encodeURIComponent(q)}` : ''}`,
        de: `${SITE_CONFIG.url}/de/search${q ? `?q=${encodeURIComponent(q)}` : ''}`,
      },
    },
  }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q } = await searchParams

  return <SearchPageClient locale={locale} initialQuery={q || ''} />
}
