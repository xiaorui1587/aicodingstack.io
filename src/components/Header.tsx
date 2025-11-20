'use client';

import { useState, memo } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MegaMenu } from './MegaMenu';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const tHeader = useTranslations('header');
  const tCommunity = useTranslations('community');

  return (
    <header className="sticky top-0 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)] z-50">
      <div className="max-w-[1200px] mx-auto px-[var(--spacing-md)]">
        <nav className="flex justify-between items-center py-[var(--spacing-sm)]">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-[var(--color-text-secondary)] transition-colors">
            <Image src="/icon.svg" alt="AI Coding Stack Logo" width={24} height={24} className="inline-block" />
            AI Coding Stack
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-[var(--spacing-md)] list-none">
            <li>
              <Link
                href="/#features"
                className="text-sm border-b border-transparent hover:border-[var(--color-border-strong)] pb-[var(--spacing-xs)] transition-all"
              >
                {tHeader('features')}
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <Link
                href="/ai-coding-stack"
                className="text-sm border-b border-transparent hover:border-[var(--color-border-strong)] pb-[var(--spacing-xs)] transition-all"
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
              >
                {tHeader('aiCodingStack')}
              </Link>
              {/* MegaMenu - positioned relative to this li */}
              <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
            </li>
            <li>
              <Link
                href="/curated-collections"
                className="text-sm border-b border-transparent hover:border-[var(--color-border-strong)] pb-[var(--spacing-xs)] transition-all"
              >
                {tHeader('collections')}
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="text-sm border-b border-transparent hover:border-[var(--color-border-strong)] pb-[var(--spacing-xs)] transition-all"
              >
                {tHeader('docs')}
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/aicodingstack/aicodingstack"
                target="_blank"
                rel="noopener"
                className="text-sm border-b border-transparent hover:border-[var(--color-border-strong)] pb-[var(--spacing-xs)] transition-all"
              >
                → {tCommunity('github')}
              </a>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-[var(--spacing-xs)] hover:bg-[var(--color-hover)] transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-[var(--spacing-sm)]">
            <ul className="flex flex-col gap-[var(--spacing-sm)] list-none">
              <li>
                <Link
                  href="/#features"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm py-[var(--spacing-xs)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {tHeader('features')}
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-coding-stack"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm py-[var(--spacing-xs)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {tHeader('aiCodingStack')}
                </Link>
              </li>
              <li>
                <Link
                  href="/curated-collections"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm py-[var(--spacing-xs)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {tHeader('collections')}
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm py-[var(--spacing-xs)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {tHeader('docs')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/aicodingstack/aicodingstack"
                  target="_blank"
                  rel="noopener"
                  className="block text-sm py-[var(--spacing-xs)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  → {tCommunity('github')}
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default memo(Header);
