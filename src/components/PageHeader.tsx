import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-[var(--spacing-lg)]">
      <div className="flex items-start justify-between mb-[var(--spacing-sm)]">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
        {action}
      </div>
      {subtitle && (
        <p className="text-base text-[var(--color-text-secondary)] font-light">{subtitle}</p>
      )}
    </div>
  )
}
