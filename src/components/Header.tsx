'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useMemo, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { MegaMenu } from './MegaMenu'

// Menu item configuration type
interface MenuItem {
  href: string
  translationKey: string
  namespace?: 'header' | 'community'
  isExternal?: boolean
  hasMegaMenu?: boolean
}

// Common CSS class names - extracted to constants for DRY
const DESKTOP_LINK_CLASSES =
  'text-sm border-b border-transparent hover:border-[var(--color-border-strong)] pb-[var(--spacing-xs)] transition-all'
const MOBILE_LINK_CLASSES =
  'block text-sm py-[var(--spacing-xs)] hover:text-[var(--color-text-secondary)] transition-colors'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const tHeader = useTranslations('header')
  const tCommunity = useTranslations('community')

  // Menu items configuration - memoized to avoid recreation on each render
  const menuItems = useMemo<MenuItem[]>(
    () => [
      { href: '/#features', translationKey: 'features', namespace: 'header' },
      {
        href: '/ai-coding-stack',
        translationKey: 'aiCodingStack',
        namespace: 'header',
        hasMegaMenu: true,
      },
      { href: '/curated-collections', translationKey: 'collections', namespace: 'header' },
      { href: '/docs', translationKey: 'docs', namespace: 'header' },
      {
        href: 'https://github.com/aicodingstack/aicodingstack.io',
        translationKey: 'github',
        namespace: 'community',
        isExternal: true,
      },
    ],
    []
  )

  // Event handlers - memoized with useCallback to prevent unnecessary re-renders
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const handleMegaMenuOpen = useCallback(() => {
    setIsMegaMenuOpen(true)
  }, [])

  const handleMegaMenuClose = useCallback(() => {
    setIsMegaMenuOpen(false)
  }, [])

  // Get translation text helper - memoized
  const getMenuText = useCallback(
    (item: MenuItem) => {
      const t = item.namespace === 'community' ? tCommunity : tHeader
      const text = t(item.translationKey as never)
      return item.isExternal ? `→ ${text}` : text
    },
    [tHeader, tCommunity]
  )

  // Render desktop menu item
  const renderDesktopMenuItem = useCallback(
    (item: MenuItem) => {
      if (item.hasMegaMenu) {
        return (
          <li
            key={item.href}
            className="relative"
            onMouseEnter={handleMegaMenuOpen}
            onMouseLeave={handleMegaMenuClose}
          >
            <Link
              href={item.href}
              className={DESKTOP_LINK_CLASSES}
              aria-expanded={isMegaMenuOpen}
              aria-haspopup="true"
            >
              {getMenuText(item)}
            </Link>
            <MegaMenu isOpen={isMegaMenuOpen} onClose={handleMegaMenuClose} />
          </li>
        )
      }

      return (
        <li key={item.href}>
          {item.isExternal ? (
            <a href={item.href} target="_blank" rel="noopener" className={DESKTOP_LINK_CLASSES}>
              {getMenuText(item)}
            </a>
          ) : (
            <Link href={item.href} className={DESKTOP_LINK_CLASSES}>
              {getMenuText(item)}
            </Link>
          )}
        </li>
      )
    },
    [isMegaMenuOpen, handleMegaMenuOpen, handleMegaMenuClose, getMenuText]
  )

  // Render mobile menu item
  const renderMobileMenuItem = useCallback(
    (item: MenuItem) => (
      <li key={item.href}>
        {item.isExternal ? (
          <a href={item.href} target="_blank" rel="noopener" className={MOBILE_LINK_CLASSES}>
            {getMenuText(item)}
          </a>
        ) : (
          <Link href={item.href} className={MOBILE_LINK_CLASSES} onClick={handleMenuClose}>
            {getMenuText(item)}
          </Link>
        )}
      </li>
    ),
    [handleMenuClose, getMenuText]
  )

  // Memoized menu button label
  const menuButtonLabel = useMemo(
    () => (isMenuOpen ? tHeader('closeMenu') : tHeader('openMenu')),
    [isMenuOpen, tHeader]
  )

  return (
    <header className="sticky top-0 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)] z-50">
      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)]">
        <nav className="flex justify-between items-center py-[var(--spacing-sm)]">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <Image
              src="/icon.svg"
              alt="AI Coding Stack Logo"
              width={24}
              height={24}
              className="inline-block"
            />
            AI Coding Stack
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-[var(--spacing-md)] list-none">
            {menuItems.map(renderDesktopMenuItem)}
          </ul>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={handleMenuToggle}
            className="md:hidden p-[var(--spacing-xs)] hover:bg-[var(--color-hover)] transition-colors"
            aria-label={tHeader('toggleMenu')}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
            >
              <title>{menuButtonLabel}</title>
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
              {menuItems.map(renderMobileMenuItem)}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}

export default memo(Header)
