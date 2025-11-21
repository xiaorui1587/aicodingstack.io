'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { LandscapeProduct, ProductCategory, VendorMatrixRow } from '@/lib/landscape-data'

interface VendorMatrixProps {
  matrixData: VendorMatrixRow[]
  locale: string
}

const PRODUCT_CATEGORIES: { key: ProductCategory; label: string; color: string }[] = [
  { key: 'ide', label: 'IDE', color: 'from-blue-500/20 to-purple-500/20' },
  { key: 'cli', label: 'CLI', color: 'from-green-500/20 to-emerald-500/20' },
  { key: 'extension', label: 'Extension', color: 'from-pink-500/20 to-rose-500/20' },
  { key: 'model', label: 'Model', color: 'from-purple-500/20 to-indigo-500/20' },
  { key: 'provider', label: 'Provider', color: 'from-indigo-500/20 to-violet-500/20' },
]

const VENDOR_TYPE_LABELS: Record<string, string> = {
  'full-stack': 'Full Stack',
  'ai-native': 'AI Native',
  'tool-only': 'Tool Only',
  'model-only': 'Model Only',
  'provider-only': 'Provider Only',
}

const VENDOR_TYPE_COLORS: Record<string, string> = {
  'full-stack': 'text-blue-400',
  'ai-native': 'text-purple-400',
  'tool-only': 'text-green-400',
  'model-only': 'text-orange-400',
  'provider-only': 'text-pink-400',
}

interface MatrixCellProps {
  products: LandscapeProduct[]
  category: ProductCategory
  categoryColor: string
}

function MatrixCell({ products, category, categoryColor }: MatrixCellProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (products.length === 0) {
    return (
      <div className="h-full min-h-[80px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center justify-center">
        <span className="text-[var(--color-text-muted)] text-sm">-</span>
      </div>
    )
  }

  if (products.length === 1) {
    const product = products[0]
    if (!product) return null
    return (
      <Link
        href={product.path}
        className={`block h-full min-h-[80px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all p-[var(--spacing-sm)] bg-gradient-to-br ${categoryColor} group`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <h4 className="font-semibold text-sm tracking-tight mb-1 group-hover:text-[var(--color-text)] transition-colors line-clamp-2">
              {product.name}
            </h4>
            {product.latestVersion && (
              <span className="text-xs text-[var(--color-text-muted)]">
                v{product.latestVersion}
              </span>
            )}
          </div>
          {product.githubStars && product.githubStars > 0 && (
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] mt-2">
              <span>⭐</span>
              <span>{product.githubStars.toLocaleString()}</span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  // Multiple products
  return (
    <div className="relative h-full min-h-[80px]">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full h-full border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all p-[var(--spacing-sm)] bg-gradient-to-br ${categoryColor} text-left`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm tracking-tight">
                {products.length} {category}s
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
              {products.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border-strong)] shadow-lg z-10 max-h-[300px] overflow-y-auto">
          {products.map(product => (
            <Link
              key={product.id}
              href={product.path}
              className="block p-[var(--spacing-sm)] hover:bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm tracking-tight truncate">{product.name}</h5>
                  {product.latestVersion && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      v{product.latestVersion}
                    </span>
                  )}
                </div>
                {product.githubStars && product.githubStars > 0 && (
                  <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                    ⭐ {product.githubStars.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VendorMatrix({ matrixData }: VendorMatrixProps) {
  const [selectedVendorTypes, setSelectedVendorTypes] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'products'>('products')

  const filteredAndSortedData = useMemo(() => {
    let filtered = matrixData

    // Filter by vendor type
    if (selectedVendorTypes.size > 0) {
      filtered = filtered.filter(row => selectedVendorTypes.has(row.vendorType))
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.vendorName.localeCompare(b.vendorName)
      }
      // Sort by total products (descending)
      const aTotal = Object.values(a.cells).reduce((sum, arr) => sum + arr.length, 0)
      const bTotal = Object.values(b.cells).reduce((sum, arr) => sum + arr.length, 0)
      return bTotal - aTotal
    })

    return sorted
  }, [matrixData, selectedVendorTypes, sortBy])

  const toggleVendorType = (type: string) => {
    const newSet = new Set(selectedVendorTypes)
    if (newSet.has(type)) {
      newSet.delete(type)
    } else {
      newSet.add(type)
    }
    setSelectedVendorTypes(newSet)
  }

  const vendorTypes = Array.from(new Set(matrixData.map(row => row.vendorType)))

  return (
    <div className="space-y-[var(--spacing-lg)]">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-[var(--spacing-md)] items-start md:items-center justify-between">
        {/* Vendor Type Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-[var(--color-text-secondary)] mr-2">Vendor Type:</span>
          {vendorTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleVendorType(type)}
              className={`px-3 py-1 text-xs border transition-all ${
                selectedVendorTypes.size === 0 || selectedVendorTypes.has(type)
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                  : 'border-[var(--color-border)] opacity-50'
              }`}
            >
              <span className={VENDOR_TYPE_COLORS[type]}>{VENDOR_TYPE_LABELS[type] || type}</span>
            </button>
          ))}
          {selectedVendorTypes.size > 0 && (
            <button
              type="button"
              onClick={() => setSelectedVendorTypes(new Set())}
              className="px-3 py-1 text-xs border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <span className="text-sm text-[var(--color-text-secondary)]">Sort by:</span>
          <button
            type="button"
            onClick={() => setSortBy('name')}
            className={`px-3 py-1 text-xs border transition-all ${
              sortBy === 'name'
                ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                : 'border-[var(--color-border)]'
            }`}
          >
            Name
          </button>
          <button
            type="button"
            onClick={() => setSortBy('products')}
            className={`px-3 py-1 text-xs border transition-all ${
              sortBy === 'products'
                ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                : 'border-[var(--color-border)]'
            }`}
          >
            Products
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto -mx-[var(--spacing-md)] px-[var(--spacing-md)]">
        <div className="min-w-[800px]">
          {/* Table Header */}
          <div className="grid grid-cols-[200px_repeat(5,1fr)] gap-2 mb-2 sticky top-0 bg-[var(--color-bg)] z-20 pb-2">
            <div className="font-semibold text-sm text-[var(--color-text-secondary)] px-2">
              Vendor
            </div>
            {PRODUCT_CATEGORIES.map(cat => (
              <div key={cat.key} className="font-semibold text-sm text-center px-2">
                {cat.label}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className="space-y-2">
            {filteredAndSortedData.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                No vendors found
              </div>
            ) : (
              filteredAndSortedData.map(row => (
                <div key={row.vendorId} className="grid grid-cols-[200px_repeat(5,1fr)] gap-2">
                  {/* Vendor Name */}
                  <div className="flex flex-col justify-center px-2 border-r border-[var(--color-border)]">
                    <Link
                      href={`/vendors/${row.vendorId}`}
                      className="font-medium text-sm hover:text-[var(--color-text)] transition-colors"
                    >
                      {row.vendorName}
                    </Link>
                    <span className={`text-xs ${VENDOR_TYPE_COLORS[row.vendorType]}`}>
                      {VENDOR_TYPE_LABELS[row.vendorType] || row.vendorType}
                    </span>
                  </div>

                  {/* Product Cells */}
                  {PRODUCT_CATEGORIES.map(cat => (
                    <div key={cat.key}>
                      <MatrixCell
                        products={row.cells[cat.key]}
                        category={cat.key}
                        categoryColor={cat.color}
                      />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-[var(--color-border)] pt-[var(--spacing-md)]">
        <p className="text-xs text-[var(--color-text-muted)] mb-2">Vendor Types:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className={VENDOR_TYPE_COLORS['full-stack']}>
            Full Stack: IDE + CLI + Extension
          </span>
          <span className={VENDOR_TYPE_COLORS['ai-native']}>
            AI Native: Model + Development Tools
          </span>
          <span className={VENDOR_TYPE_COLORS['tool-only']}>Tool Only: IDE/CLI/Extension</span>
          <span className={VENDOR_TYPE_COLORS['model-only']}>Model Only: Model Provider</span>
          <span className={VENDOR_TYPE_COLORS['provider-only']}>Provider Only: API Provider</span>
        </div>
      </div>
    </div>
  )
}
