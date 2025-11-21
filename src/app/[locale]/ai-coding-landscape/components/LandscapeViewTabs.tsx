'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type {
  LandscapeProduct,
  LandscapeStats,
  RelationshipEdge,
  RelationshipNode,
  VendorMatrixRow,
} from '@/lib/landscape-data'
import ProductCategories from './ProductCategories'
import StatisticsDashboard from './StatisticsDashboard'
import VendorMatrix from './VendorMatrix'

// Dynamically import RelationshipGraph to avoid SSR issues with React Flow
const RelationshipGraph = dynamic(() => import('./RelationshipGraph').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] rounded-lg flex items-center justify-center">
      <div className="text-[var(--color-text-muted)]">Loading relationship graph...</div>
    </div>
  ),
})

interface LandscapeViewTabsProps {
  matrixData: VendorMatrixRow[]
  graphData: {
    nodes: RelationshipNode[]
    edges: RelationshipEdge[]
  }
  productsByCategory: {
    ides: LandscapeProduct[]
    clis: LandscapeProduct[]
    extensions: LandscapeProduct[]
    models: LandscapeProduct[]
    providers: LandscapeProduct[]
  }
  stats: LandscapeStats
  locale: string
}

type TabKey = 'matrix' | 'graph' | 'categories' | 'stats'

interface Tab {
  key: TabKey
  label: string
  icon: string
  description: string
}

const TABS: Tab[] = [
  {
    key: 'matrix',
    label: 'Vendor Matrix',
    icon: '📊',
    description: 'Vendor ecosystem matrix view',
  },
  {
    key: 'graph',
    label: 'Relationship Graph',
    icon: '🕸️',
    description: 'Interactive network visualization',
  },
  {
    key: 'categories',
    label: 'Product Categories',
    icon: '📂',
    description: 'Browse products by category',
  },
  {
    key: 'stats',
    label: 'Statistics',
    icon: '📈',
    description: 'Ecosystem statistics and insights',
  },
]

export default function LandscapeViewTabs({
  matrixData,
  graphData,
  productsByCategory,
  stats,
  locale,
}: LandscapeViewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('matrix')

  return (
    <div className="space-y-[var(--spacing-lg)]">
      {/* Tab Navigation */}
      <div className="border-b border-[var(--color-border)]">
        <div className="flex flex-wrap gap-2 pb-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 border transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] -mb-[1px] border-b-transparent font-semibold'
                  : 'border-transparent hover:border-[var(--color-border)]'
              }`}
            >
              <span>{tab.icon}</span>
              <div className="text-left">
                <div className="text-sm">{tab.label}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'matrix' && <VendorMatrix matrixData={matrixData} locale={locale} />}

        {activeTab === 'graph' && <RelationshipGraph graphData={graphData} />}

        {activeTab === 'categories' && (
          <ProductCategories productsByCategory={productsByCategory} />
        )}

        {activeTab === 'stats' && <StatisticsDashboard stats={stats} />}
      </div>
    </div>
  )
}
