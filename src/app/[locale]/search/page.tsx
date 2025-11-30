import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import {
  buildLanguageAlternates,
  buildOpenGraph,
  buildTitle,
  buildTwitterCard,
} from '@/lib/metadata'
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

  // Build canonical path based on locale (without query params for canonical)
  const canonicalPath = locale === 'en' ? '/search' : `/${locale}/search`

  // Build query string if search query exists
  const queryString = q ? `?q=${encodeURIComponent(q)}` : ''

  // Build full URL with query params for OpenGraph
  const searchUrl = `${canonicalPath}${queryString}`

  // Build language alternates with query params
  const languageAlternates = buildLanguageAlternates('search')
  const alternatesWithQuery: Record<string, string> = {}
  Object.entries(languageAlternates).forEach(([lang, path]) => {
    alternatesWithQuery[lang] = `${path}${queryString}`
  })

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
      canonical: canonicalPath,
      languages: alternatesWithQuery,
    },
  }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q } = await searchParams

  return <SearchPageClient locale={locale} initialQuery={q || ''} />
}
