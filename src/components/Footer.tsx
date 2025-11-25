'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import LanguageSwitcher from './controls/LanguageSwitcher'
import { useTheme } from './ThemeProvider'

// Footer link list component to reduce code duplication
interface FooterLinkListProps {
  title: string
  links: Array<{ href: string; label: string; isExternal?: boolean }>
}

function FooterLinkList({ title, links }: FooterLinkListProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-2">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <ul className="flex flex-col gap-[var(--spacing-xs)] list-none">
        {links.map(item => (
          <li key={item.href}>
            {item.isExternal ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-light"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-light"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Footer() {
  const { theme, toggleTheme } = useTheme()
  const tFooter = useTranslations('footer')
  const tCommunity = useTranslations('community')
  const tStacks = useTranslations('stacks')
  const tNav = useTranslations('header')

  // Define link arrays (static hrefs, only labels depend on translations)
  const resourceLinks = [
    { href: '/ides', label: tStacks('ides') },
    { href: '/clis', label: tStacks('clis') },
    { href: '/extensions', label: tStacks('extensions') },
    { href: '/models', label: tStacks('models') },
    { href: '/model-providers', label: tStacks('modelProviders') },
    { href: '/vendors', label: tStacks('vendors') },
  ]

  const documentationLinks = [
    { href: '/docs', label: tNav('docs') },
    { href: '/articles', label: tNav('articles') },
    { href: '/curated-collections', label: tNav('curatedCollections') },
    { href: '/#faq', label: tFooter('faq') },
  ]

  const communityLinks = [
    {
      href: 'https://github.com/aicodingstack/aicodingstack.io',
      label: tCommunity('github'),
      isExternal: true,
    },
    {
      href: 'https://aicodingstack.io/discord',
      label: tCommunity('discord'),
      isExternal: true,
    },
    {
      href: 'https://x.com/aicodingstack',
      label: tCommunity('twitter'),
      isExternal: false,
    },
  ]

  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] py-[var(--spacing-xl)] pb-[var(--spacing-md)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-[var(--spacing-lg)] mb-[var(--spacing-lg)]">
          <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-3">
            <span className="text-sm font-semibold tracking-tight">{tFooter('aicodingstack')}</span>
            <p className="text-sm pb-[var(--spacing-sm)] leading-[1.8] text-[var(--color-text-secondary)] font-light">
              {tFooter('tagline')}
              <span className="block mt-[var(--spacing-sm)]">{tFooter('openSource')}</span>
            </p>
            <div className="flex gap-[var(--spacing-xs)]">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-block w-auto px-[var(--spacing-sm)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors text-xs font-light tracking-tight text-left"
                aria-label={tFooter('toggleTheme')}
              >
                {theme === 'light' ? `◐ ${tFooter('darkMode')}` : `◑ ${tFooter('lightMode')}`}
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          <FooterLinkList title={tFooter('resources')} links={resourceLinks} />
          <FooterLinkList title={tFooter('documentation')} links={documentationLinks} />
          <FooterLinkList title={tFooter('community')} links={communityLinks} />
        </div>

        <div className="border-t border-[var(--color-border)] pt-[var(--spacing-md)]">
          <div className="text-center">
            <div className="text-[0.75rem] leading-tight text-[var(--color-text-muted)]">
              {tFooter('copyright')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
