'use client'

import Link from 'next/link'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LandscapeStats } from '@/lib/landscape-data'

interface StatisticsDashboardProps {
  stats: LandscapeStats
}

const CATEGORY_COLORS: Record<string, string> = {
  ides: '#3b82f6', // blue
  clis: '#10b981', // green
  extensions: '#ec4899', // pink
  models: '#8b5cf6', // purple
  providers: '#6366f1', // indigo
}

const LICENSE_COLORS = {
  'Open Source': '#10b981',
  Proprietary: '#f59e0b',
}

export default function StatisticsDashboard({ stats }: StatisticsDashboardProps) {
  // Prepare category distribution data
  const categoryData = [
    { name: 'IDEs', value: stats.counts.ides, color: CATEGORY_COLORS.ides },
    { name: 'CLIs', value: stats.counts.clis, color: CATEGORY_COLORS.clis },
    { name: 'Extensions', value: stats.counts.extensions, color: CATEGORY_COLORS.extensions },
    { name: 'Models', value: stats.counts.models, color: CATEGORY_COLORS.models },
    { name: 'Providers', value: stats.counts.providers, color: CATEGORY_COLORS.providers },
  ]

  // Prepare license distribution data
  const licenseData = [
    { name: 'Open Source', value: stats.openSourceCount, color: LICENSE_COLORS['Open Source'] },
    { name: 'Proprietary', value: stats.proprietaryCount, color: LICENSE_COLORS.Proprietary },
  ]

  // Prepare platform support data
  const platformData = [
    { name: 'macOS', count: stats.platformSupport.macOS },
    { name: 'Windows', count: stats.platformSupport.windows },
    { name: 'Linux', count: stats.platformSupport.linux },
  ]

  // Prepare vendor product count data (top 10)
  const topVendors = stats.vendorsByProductCount.slice(0, 10)

  return (
    <div className="space-y-[var(--spacing-xl)]">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <div className="text-3xl font-bold tracking-tight mb-2">{stats.totalProducts}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Total Products</div>
        </div>
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <div className="text-3xl font-bold tracking-tight mb-2">{stats.totalVendors}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Total Vendors</div>
        </div>
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-gradient-to-br from-pink-500/10 to-rose-500/10">
          <div className="text-3xl font-bold tracking-tight mb-2">{stats.openSourceCount}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Open Source</div>
        </div>
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
          <div className="text-3xl font-bold tracking-tight mb-2">{stats.proprietaryCount}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Proprietary</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-lg)]">
        {/* Category Distribution Pie Chart */}
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <h3 className="text-lg font-semibold mb-[var(--spacing-md)] flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">{'//'}</span>
            Product Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: unknown) => {
                  const data = props as { percent?: number; name?: string }
                  const percent = data.percent || 0
                  const name = data.name || ''
                  return `${name} ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* License Distribution Pie Chart */}
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <h3 className="text-lg font-semibold mb-[var(--spacing-md)] flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">{'//'}</span>
            License Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={licenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: unknown) => {
                  const data = props as { percent?: number; name?: string }
                  const percent = data.percent || 0
                  const name = data.name || ''
                  return `${name} ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {licenseData.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-[var(--spacing-lg)]">
        {/* Platform Support Bar Chart */}
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <h3 className="text-lg font-semibold mb-[var(--spacing-md)] flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">{'//'}</span>
            Platform Support
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vendors by Product Count Bar Chart */}
        <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <h3 className="text-lg font-semibold mb-[var(--spacing-md)] flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">{'//'}</span>
            Top Vendors by Product Count
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topVendors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-text-secondary)" />
              <YAxis
                dataKey="vendorName"
                type="category"
                width={120}
                stroke="var(--color-text-secondary)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Bar dataKey="productCount" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top by GitHub Stars */}
      <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h3 className="text-lg font-semibold mb-[var(--spacing-md)] flex items-center gap-2">
          <span className="text-[var(--color-text-muted)]">{'//'}</span>
          Top 10 Products by GitHub Stars
        </h3>
        <div className="space-y-[var(--spacing-sm)]">
          {stats.topByStars.map((product, index) => (
            <div
              key={`${product.category}-${product.id}`}
              className="flex items-center justify-between p-[var(--spacing-md)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all"
            >
              <div className="flex items-center gap-[var(--spacing-md)] flex-1 min-w-0">
                <span className="text-lg font-bold text-[var(--color-text-muted)] w-8">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${product.category === 'model' ? 'models' : product.category === 'provider' ? 'model-providers' : `${product.category}s`}/${product.id}`}
                    className="font-medium text-sm hover:text-[var(--color-text)] transition-colors truncate block"
                  >
                    {product.name}
                  </Link>
                  <span className="text-xs text-[var(--color-text-muted)] uppercase">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <span>⭐</span>
                <span>{product.stars.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="p-[var(--spacing-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h3 className="text-lg font-semibold mb-[var(--spacing-md)] flex items-center gap-2">
          <span className="text-[var(--color-text-muted)]">{'//'}</span>
          Category Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-[var(--spacing-md)]">
          {categoryData.map(cat => (
            <Link
              key={cat.name}
              href={`/${cat.name.toLowerCase()}`}
              className="p-[var(--spacing-md)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:-translate-y-1 transition-all group"
              style={{ backgroundColor: `${cat.color}15` }}
            >
              <div className="text-2xl font-bold tracking-tight mb-1" style={{ color: cat.color }}>
                {cat.value}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">
                {cat.name}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-2">
                {((cat.value / stats.totalProducts) * 100).toFixed(1)}% of total
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
