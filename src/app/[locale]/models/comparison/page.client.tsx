'use client'

import { FileText, Github, Home, Twitter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import ComparisonTable, { type ComparisonColumn } from '@/components/ComparisonTable'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Link } from '@/i18n/navigation'
import { modelsData as models } from '@/lib/generated'

type Props = {
  locale: string
}

export default function ModelComparisonPageClient({ locale }: Props) {
  const tComparison = useTranslations('comparison')
  const tCommunity = useTranslations('community')
  const breadcrumbRef = useRef<HTMLElement>(null)
  const [isBreadcrumbFixed, setIsBreadcrumbFixed] = useState(false)
  const [breadcrumbHeight, setBreadcrumbHeight] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!breadcrumbRef.current) return

      const headerHeight = 60 // Height of the site header
      const breadcrumbTop = breadcrumbRef.current.offsetTop

      if (window.scrollY > breadcrumbTop - headerHeight) {
        if (!isBreadcrumbFixed) {
          setBreadcrumbHeight(breadcrumbRef.current.offsetHeight)
        }
        setIsBreadcrumbFixed(true)
      } else {
        setIsBreadcrumbFixed(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isBreadcrumbFixed])

  const columns: ComparisonColumn[] = [
    {
      key: 'vendor',
      label: tComparison('columns.vendor'),
    },
    {
      key: 'size',
      label: tComparison('columns.modelSize'),
    },
    {
      key: 'totalContext',
      label: tComparison('columns.contextLength'),
    },
    {
      key: 'maxOutput',
      label: tComparison('columns.maxOutput'),
    },
    {
      key: 'tokenPricing',
      label: tComparison('columns.pricing'),
      render: (value: unknown) => {
        if (!value || typeof value !== 'object') return '-'
        const pricing = value as {
          input?: number | null
          output?: number | null
          cache?: number | null
        }
        if (pricing.input !== null && pricing.input !== undefined) {
          return `$${pricing.input}/M`
        }
        if (pricing.output !== null && pricing.output !== undefined) {
          return `$${pricing.output}/M`
        }
        return '-'
      },
    },
    {
      key: 'links',
      label: tComparison('columns.links'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const websiteUrl = item.websiteUrl as string | null | undefined
        const platformUrls = item.platformUrls as
          | {
              huggingface?: string | null
              artificialAnalysis?: string | null
              openrouter?: string | null
            }
          | undefined

        return (
          <div className="flex gap-2 items-center">
            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tComparison('linkTitles.officialWebsite')}
              >
                <Home className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Home className="w-3.5 h-3.5" />
              </span>
            )}
            {platformUrls?.huggingface ? (
              <a
                href={platformUrls.huggingface}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('huggingface')}
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <FileText className="w-3.5 h-3.5" />
              </span>
            )}
            {platformUrls?.artificialAnalysis ? (
              <a
                href={platformUrls.artificialAnalysis}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('artificialAnalysis')}
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Github className="w-3.5 h-3.5" />
              </span>
            )}
            {platformUrls?.openrouter ? (
              <a
                href={platformUrls.openrouter}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('openrouter')}
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Twitter className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <Header />

      {/* Fixed Breadcrumb (when scrolled) */}
      {isBreadcrumbFixed && (
        <section className="fixed top-[60px] left-0 right-0 z-30 py-[var(--spacing-sm)] bg-[var(--color-hover)] border-b border-[var(--color-border)] shadow-sm">
          <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)]">
            <nav className="flex items-center gap-[var(--spacing-xs)] text-[0.8125rem]">
              <Link
                href={`/${locale}/ai-coding-stack`}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                {tComparison('breadcrumb.aiCodingStack')}
              </Link>
              <span className="text-[var(--color-text-muted)]">/</span>
              <Link
                href={`/${locale}/models`}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                {tComparison('breadcrumb.models')}
              </Link>
              <span className="text-[var(--color-text-muted)]">/</span>
              <span className="text-[var(--color-text)] font-medium">
                {tComparison('breadcrumb.comparison')}
              </span>
            </nav>
          </div>
        </section>
      )}

      {/* Breadcrumb (original position) */}
      <section
        ref={breadcrumbRef}
        className="py-[var(--spacing-sm)] bg-[var(--color-hover)] border-b border-[var(--color-border)]"
      >
        <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)]">
          <nav
            className={`flex items-center gap-[var(--spacing-xs)] text-[0.8125rem] ${isBreadcrumbFixed ? 'invisible' : ''}`}
          >
            <Link
              href={`/${locale}/ai-coding-stack`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {tComparison('breadcrumb.aiCodingStack')}
            </Link>
            <span className="text-[var(--color-text-muted)]">/</span>
            <Link
              href={`/${locale}/models`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {tComparison('breadcrumb.models')}
            </Link>
            <span className="text-[var(--color-text-muted)]">/</span>
            <span className="text-[var(--color-text)] font-medium">
              {tComparison('breadcrumb.comparison')}
            </span>
          </nav>
        </div>
      </section>

      {/* Page Header */}
      <section className="py-[var(--spacing-lg)] border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)]">
          <h1 className="text-[2.5rem] font-semibold tracking-[-0.04em] mb-[var(--spacing-sm)]">
            {tComparison('models.title')}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] font-light leading-relaxed">
            {tComparison('models.subtitle')}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)]">
          <ComparisonTable
            items={models as unknown as Record<string, unknown>[]}
            columns={columns}
            itemLinkPrefix={`/${locale}/models`}
            stickyTopOffset={60 + (isBreadcrumbFixed ? breadcrumbHeight : 0)}
          />
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)]">
          <Link
            href={`/${locale}/models`}
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            ← {tComparison('models.backTo')}
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
