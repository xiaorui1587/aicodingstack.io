'use client'

import { Download, FileText, Github, Home, Linkedin, Twitter, Youtube } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import ComparisonTable, { type ComparisonColumn } from '@/components/ComparisonTable'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Link } from '@/i18n/navigation'
import { extensionsData as extensions } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { renderLicense } from '@/lib/license'
import { formatPrice, type PricingTier } from '@/lib/pricing'

type Props = {
  locale: string
}

export default function ExtensionComparisonPageClient({ locale }: Props) {
  const tComparison = useTranslations('comparison')
  const tCommunity = useTranslations('community')
  const t = useTranslations()
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
      key: 'license',
      label: tComparison('columns.license'),
      render: (value: unknown, item: Record<string, unknown>) => renderLicense(value, item, t),
    },
    {
      key: 'latestVersion',
      label: tComparison('columns.version'),
    },
    {
      key: 'supportedIdes',
      label: tComparison('columns.supportedIdes'),
      render: (value: unknown) => {
        const supportedIdes = value as Array<{ ideId: string }> | undefined
        if (!supportedIdes || supportedIdes.length === 0) return '-'
        return (
          <div className="flex flex-wrap gap-1 text-xs">
            {supportedIdes.map(item => (
              <span
                key={item.ideId}
                className="px-1.5 py-0.5 bg-[var(--color-hover)] border border-[var(--color-border)] rounded text-[var(--color-text-secondary)]"
              >
                {item.ideId}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      key: 'githubStars',
      label: tComparison('columns.githubStars'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const id = item.id as string
        const stars = getGithubStars('extensions', id)
        const communityUrls = item.communityUrls as
          | {
              github?: string
            }
          | undefined
        const githubUrl = communityUrls?.github

        if (stars === null || stars === undefined)
          return <span className="text-right block">-</span>

        const starsText = `${stars.toFixed(1)}k`

        if (githubUrl) {
          return (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener"
              className="text-right block hover:text-[var(--color-text-secondary)] transition-colors hover:underline"
            >
              {starsText}
            </a>
          )
        }

        return <span className="text-right block">{starsText}</span>
      },
    },
    {
      key: 'links',
      label: tComparison('columns.links'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const websiteUrl = item.websiteUrl as string | undefined
        const docsUrl = item.docsUrl as string | undefined
        const resourceUrls = item.resourceUrls as
          | {
              download?: string
            }
          | undefined
        const communityUrls = item.communityUrls as
          | {
              github?: string
              twitter?: string
              linkedin?: string
              youtube?: string
              reddit?: string
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
            {resourceUrls?.download ? (
              <a
                href={resourceUrls.download}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tComparison('linkTitles.download')}
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Download className="w-3.5 h-3.5" />
              </span>
            )}
            {docsUrl ? (
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tComparison('linkTitles.documentation')}
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <FileText className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.github ? (
              <a
                href={communityUrls.github}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('github')}
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Github className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.twitter ? (
              <a
                href={communityUrls.twitter}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('twitter')}
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Twitter className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.linkedin ? (
              <a
                href={communityUrls.linkedin}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('linkedin')}
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Linkedin className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.youtube ? (
              <a
                href={communityUrls.youtube}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('youtube')}
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Youtube className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'pricing-free',
      label: tComparison('columns.freePlan'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        if (!pricing || pricing.length === 0) return '✓' // Extensions without pricing info are typically free
        const freePlan = pricing.find(p => p.value === 0)
        return freePlan || pricing.length === 0 ? '✓' : '-'
      },
    },
    {
      key: 'pricing-min',
      label: tComparison('columns.startingPrice'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        if (!pricing || pricing.length === 0) return tComparison('pricingValues.free')
        const paidPlans = pricing.filter(p => p.value && p.value > 0)
        if (paidPlans.length === 0) return tComparison('pricingValues.freeOnly')
        const minPrice = Math.min(...paidPlans.map(p => p.value as number))
        const minPlan = paidPlans.find(p => p.value === minPrice)
        return minPlan ? formatPrice(minPlan) : '-'
      },
    },
    {
      key: 'pricing-max',
      label: tComparison('columns.maxPrice'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        if (!pricing || pricing.length === 0) return '-'
        const paidPlans = pricing.filter(p => p.value && p.value > 0)
        if (paidPlans.length === 0) return '-'
        const maxPrice = Math.max(...paidPlans.map(p => p.value as number))
        const maxPlan = paidPlans.find(p => p.value === maxPrice)
        return maxPlan ? formatPrice(maxPlan) : '-'
      },
    },
  ]

  return (
    <>
      <Header />

      {/* Fixed Breadcrumb (when scrolled) */}
      {isBreadcrumbFixed && (
        <section className="fixed top-[60px] left-0 right-0 z-30 py-[var(--spacing-sm)] bg-[var(--color-hover)] border-b border-[var(--color-border)] shadow-sm">
          <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
            <nav className="flex items-center gap-[var(--spacing-xs)] text-[0.8125rem]">
              <Link
                href={`/${locale}/ai-coding-stack`}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                {tComparison('breadcrumb.aiCodingStack')}
              </Link>
              <span className="text-[var(--color-text-muted)]">/</span>
              <Link
                href={`/${locale}/extensions`}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                {tComparison('breadcrumb.extensions')}
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
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
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
              href={`/${locale}/extensions`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {tComparison('breadcrumb.extensions')}
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
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {tComparison('extensions.title')}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] font-light">
            {tComparison('extensions.subtitle')}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <ComparisonTable
            items={extensions as unknown as Record<string, unknown>[]}
            columns={columns}
            itemLinkPrefix={`/${locale}/extensions`}
            stickyTopOffset={60 + (isBreadcrumbFixed ? breadcrumbHeight : 0)}
          />
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <Link
            href={`/${locale}/extensions`}
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            ← {tComparison('extensions.backTo')}
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
