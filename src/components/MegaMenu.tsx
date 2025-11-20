'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  href: string;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const tStacks = useTranslations('stacks');
  const tNav = useTranslations('header');

  // Translate directly when defining menu sections
  const menuSections = {
    development: [
      { name: tStacks('ides'), href: '/ides' },
      { name: tStacks('clis'), href: '/clis' },
      { name: tStacks('extensions'), href: '/extensions' }
    ] as MenuItem[],
    intelligence: [
      { name: tStacks('models'), href: '/models' },
      { name: tStacks('modelProviders'), href: '/model-providers' }
    ] as MenuItem[]
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-[-2rem] pt-[var(--spacing-xs)] w-[570px] z-50"
    >
      {/* Invisible bridge area to prevent menu from closing */}
      <div className="h-[var(--spacing-xs)]" />

      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg animate-fadeIn">
        <div className="p-[var(--spacing-md)]">
        {/* AI Coding Landscape */}
        <Link
          href="/ai-coding-landscape"
          onClick={onClose}
          className="block mb-[var(--spacing-md)] p-[var(--spacing-sm)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] transition-all"
        >
          <div className="font-medium mb-[var(--spacing-xs)]">
            {tNav('aiCodingLandscape')}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            {tNav('aiCodingLandscapeDesc')}
          </div>
        </Link>

        {/* Two Column Grid */}
        <div className="grid grid-cols-2 gap-[var(--spacing-md)] mb-[var(--spacing-sm)]">
          {/* Development Tools */}
          <div>
            <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
              {tNav('developmentTools')}
            </h4>
            <ul className="space-y-1">
              {menuSections.development.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block px-[var(--spacing-xs)] py-1 text-sm hover:bg-[var(--color-hover)] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence */}
          <div>
            <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
              {tNav('intelligence')}
            </h4>
            <ul className="space-y-1">
              {menuSections.intelligence.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block px-[var(--spacing-xs)] py-1 text-sm hover:bg-[var(--color-hover)] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* All Vendors */}
        <Link
          href="/vendors"
          onClick={onClose}
          className="flex items-center justify-between px-[var(--spacing-sm)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] transition-all group"
        >
          <span className="text-sm font-medium">{tStacks('vendors')}</span>
          <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
            →
          </span>
        </Link>
        </div>
      </div>
    </div>
  );
}
