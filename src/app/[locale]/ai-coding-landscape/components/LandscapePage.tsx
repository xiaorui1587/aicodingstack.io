'use client'

import { BackToNavigation } from '@/components/controls/BackToNavigation'
import type { VendorMatrixRow } from '@/lib/landscape-data'
import VendorMatrix from './VendorMatrix'

interface LandscapePageProps {
  matrixData: VendorMatrixRow[]
  locale: string
  translations: {
    title: string
    description: string
    backTitle: string
  }
}

export default function LandscapePage({ matrixData, locale, translations }: LandscapePageProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
      {/* Page Header */}
      <div className="mb-[var(--spacing-lg)]">
        <h1 className="text-[2rem] font-semibold tracking-[-0.02em] mb-[var(--spacing-xs)]">
          {translations.title}
        </h1>
        <p className="text-[var(--color-text-secondary)]">{translations.description}</p>
      </div>

      {/* Vendor Matrix */}
      <VendorMatrix matrixData={matrixData} locale={locale} />

      {/* Back to Overview */}
      <div className="mt-[var(--spacing-xl)]">
        <BackToNavigation href="/ai-coding-stack" title={translations.backTitle} />
      </div>
    </div>
  )
}
