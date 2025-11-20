'use client';

import { Link } from '@/i18n/navigation';
import LandscapeViewTabs from './LandscapeViewTabs';
import { BackToNavigation } from '@/components/controls/BackToNavigation';
import type {
  VendorMatrixRow,
  LandscapeStats,
  RelationshipNode,
  RelationshipEdge,
  LandscapeProduct,
} from '@/lib/landscape-data';

interface LandscapePageProps {
  matrixData: VendorMatrixRow[];
  graphData: {
    nodes: RelationshipNode[];
    edges: RelationshipEdge[];
  };
  productsByCategory: {
    ides: LandscapeProduct[];
    clis: LandscapeProduct[];
    extensions: LandscapeProduct[];
    models: LandscapeProduct[];
    providers: LandscapeProduct[];
  };
  stats: LandscapeStats;
  locale: string;
  translations: {
    title: string;
    description: string;
    backTitle: string;
  };
}

export default function LandscapePage({
  matrixData,
  graphData,
  productsByCategory,
  stats,
  locale,
  translations,
}: LandscapePageProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
      {/* Page Header */}
      <div className="text-center mb-[var(--spacing-xl)]">
        <h1 className="text-[3rem] font-semibold tracking-[-0.04em] mb-[var(--spacing-sm)]">
          <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">🗺️</span>
          {translations.title}
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] font-light max-w-[800px] mx-auto">
          {translations.description}
        </p>
      </div>

      {/* Quick Stats Summary */}
      <div className="mb-[var(--spacing-xl)] p-[var(--spacing-lg)] border border-[var(--color-border)] bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-[var(--spacing-md)] text-center">
          <div>
            <div className="text-2xl font-bold tracking-tight">{stats.totalProducts}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Products</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{stats.totalVendors}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Vendors</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{stats.counts.ides}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">IDEs</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{stats.counts.clis}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">CLIs</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{stats.counts.extensions}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Extensions</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <LandscapeViewTabs
        matrixData={matrixData}
        graphData={graphData}
        productsByCategory={productsByCategory}
        stats={stats}
        locale={locale}
      />

      {/* Back to Overview */}
      <div className="mt-[var(--spacing-xl)]">
        <BackToNavigation href="/ai-coding-stack" title={translations.backTitle} />
      </div>
    </div>
  );
}
