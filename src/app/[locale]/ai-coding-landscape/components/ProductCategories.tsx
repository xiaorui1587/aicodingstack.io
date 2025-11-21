'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { LandscapeProduct, ProductCategory } from '@/lib/landscape-data'

interface ProductCategoriesProps {
  productsByCategory: {
    ides: LandscapeProduct[]
    clis: LandscapeProduct[]
    extensions: LandscapeProduct[]
    models: LandscapeProduct[]
    providers: LandscapeProduct[]
  }
}

const CATEGORIES: {
  key: keyof ProductCategoriesProps['productsByCategory']
  label: string
  icon: string
  color: string
  path: string
}[] = [
  {
    key: 'ides',
    label: 'IDEs',
    icon: '📝',
    color: 'from-blue-500/20 to-purple-500/20',
    path: 'ides',
  },
  {
    key: 'clis',
    label: 'CLIs',
    icon: '💻',
    color: 'from-green-500/20 to-emerald-500/20',
    path: 'clis',
  },
  {
    key: 'extensions',
    label: 'Extensions',
    icon: '🔌',
    color: 'from-pink-500/20 to-rose-500/20',
    path: 'extensions',
  },
  {
    key: 'models',
    label: 'Models',
    icon: '🤖',
    color: 'from-purple-500/20 to-indigo-500/20',
    path: 'models',
  },
  {
    key: 'providers',
    label: 'Providers',
    icon: '🔑',
    color: 'from-indigo-500/20 to-violet-500/20',
    path: 'model-providers',
  },
]

type SortOption = 'name' | 'stars' | 'vendor'

interface ProductCardProps {
  product: LandscapeProduct
  categoryColor: string
}

function ProductCard({ product, categoryColor }: ProductCardProps) {
  return (
    <Link
      href={product.path}
      className={`block p-[var(--spacing-md)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:-translate-y-1 transition-all group bg-gradient-to-br ${categoryColor}`}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm tracking-tight group-hover:text-[var(--color-text)] transition-colors line-clamp-1">
              {product.name}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">by {product.vendor}</p>
          </div>
          {product.githubStars && product.githubStars > 0 && (
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
              <span>⭐</span>
              <span>{product.githubStars.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
          {product.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
          {product.latestVersion && <span className="font-mono">v{product.latestVersion}</span>}
          {product.license && (
            <span className="px-2 py-0.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded">
              {product.license}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function ProductCategories({ productsByCategory }: ProductCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    keyof ProductCategoriesProps['productsByCategory'] | 'all'
  >('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'open-source' | 'proprietary'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Get products for selected category
  const selectedProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return [
        ...productsByCategory.ides,
        ...productsByCategory.clis,
        ...productsByCategory.extensions,
        ...productsByCategory.models,
        ...productsByCategory.providers,
      ]
    }
    return productsByCategory[selectedCategory]
  }, [selectedCategory, productsByCategory])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedProducts

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.vendor.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    }

    // License filter
    if (licenseFilter !== 'all') {
      filtered = filtered.filter(p => {
        if (licenseFilter === 'open-source') {
          return p.license && p.license.toLowerCase() !== 'proprietary'
        }
        return p.license && p.license.toLowerCase() === 'proprietary'
      })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'stars':
          return (b.githubStars || 0) - (a.githubStars || 0)
        case 'vendor':
          return a.vendor.localeCompare(b.vendor)
        default:
          return 0
      }
    })

    return sorted
  }, [selectedProducts, searchQuery, licenseFilter, sortBy])

  // Group products by vendor
  const productsByVendor = useMemo(() => {
    const grouped = new Map<string, LandscapeProduct[]>()
    filteredAndSortedProducts.forEach(product => {
      if (!grouped.has(product.vendor)) {
        grouped.set(product.vendor, [])
      }
      grouped.get(product.vendor)!.push(product)
    })
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredAndSortedProducts])

  const getCategoryColor = (category: ProductCategory): string => {
    const cat = CATEGORIES.find(c => c.key === `${category}s`)
    return cat?.color || 'from-gray-500/20 to-slate-500/20'
  }

  return (
    <div className="space-y-[var(--spacing-lg)]">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 text-sm border transition-all ${
            selectedCategory === 'all'
              ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] font-semibold'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 text-sm border transition-all flex items-center gap-2 ${
              selectedCategory === cat.key
                ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] font-semibold'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              ({productsByCategory[cat.key].length})
            </span>
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-[var(--spacing-md)] items-start md:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search products, vendors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-border-strong)] focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* License Filter */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setLicenseFilter('all')}
              className={`px-3 py-1 text-xs border transition-all ${
                licenseFilter === 'all'
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setLicenseFilter('open-source')}
              className={`px-3 py-1 text-xs border transition-all ${
                licenseFilter === 'open-source'
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              Open Source
            </button>
            <button
              type="button"
              onClick={() => setLicenseFilter('proprietary')}
              className={`px-3 py-1 text-xs border transition-all ${
                licenseFilter === 'proprietary'
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              Proprietary
            </button>
          </div>

          {/* Sort */}
          <div className="flex gap-1">
            <span className="text-sm text-[var(--color-text-secondary)] self-center mr-1">
              Sort:
            </span>
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
              onClick={() => setSortBy('stars')}
              className={`px-3 py-1 text-xs border transition-all ${
                sortBy === 'stars'
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              Stars
            </button>
            <button
              type="button"
              onClick={() => setSortBy('vendor')}
              className={`px-3 py-1 text-xs border transition-all ${
                sortBy === 'vendor'
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-[var(--color-text-secondary)]">
        Showing {filteredAndSortedProducts.length} product
        {filteredAndSortedProducts.length !== 1 ? 's' : ''}
        {sortBy === 'vendor' && productsByVendor.length > 0 && (
          <span>
            {' '}
            from {productsByVendor.length} vendor{productsByVendor.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">No products found</div>
      ) : sortBy === 'vendor' ? (
        // Grouped by vendor
        <div className="space-y-[var(--spacing-xl)]">
          {productsByVendor.map(([vendor, products]) => (
            <div key={vendor}>
              <h3 className="text-lg font-semibold mb-[var(--spacing-md)] flex items-center gap-2">
                <span className="text-[var(--color-text-muted)]">{'//'}</span>
                <Link
                  href={`/vendors/${vendor.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {vendor}
                </Link>
                <span className="text-sm font-normal text-[var(--color-text-muted)]">
                  ({products.length})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
                {products.map(product => (
                  <ProductCard
                    key={`${product.category}-${product.id}`}
                    product={product}
                    categoryColor={getCategoryColor(product.category)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Simple grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
          {filteredAndSortedProducts.map(product => (
            <ProductCard
              key={`${product.category}-${product.id}`}
              product={product}
              categoryColor={getCategoryColor(product.category)}
            />
          ))}
        </div>
      )}

      {/* View All Links */}
      {selectedCategory !== 'all' && (
        <div className="border-t border-[var(--color-border)] pt-[var(--spacing-lg)]">
          <Link
            href={CATEGORIES.find(c => c.key === selectedCategory)?.path || '#'}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <span>View all {CATEGORIES.find(c => c.key === selectedCategory)?.label}</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  )
}
