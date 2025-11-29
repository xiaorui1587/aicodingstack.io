import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import LanguageSwitcher from './controls/LanguageSwitcher'
import ThemeSwitcher from './controls/ThemeSwitcher'

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
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="footer-link">
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className="footer-link">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function Footer() {
  const tFooter = await getTranslations('footer')
  const tCommunity = await getTranslations('community')
  const tStacks = await getTranslations('stacks')
  const tHeader = await getTranslations('header')

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
    { href: '/docs', label: tFooter('docs') },
    { href: '/articles', label: tFooter('articles') },
    { href: '/curated-collections', label: tFooter('curatedCollections') },
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
            <span className="text-sm font-semibold tracking-tight">{tHeader('aiCodingStack')}</span>
            <p className="text-sm pb-[var(--spacing-sm)] leading-[1.8] text-[var(--color-text-secondary)] font-light">
              {tFooter('tagline')}
              <span className="block mt-[var(--spacing-sm)]">{tFooter('openSource')}</span>
            </p>
            <div className="flex gap-[var(--spacing-xs)]">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>

          <FooterLinkList title={tFooter('resources')} links={resourceLinks} />
          <FooterLinkList title={tFooter('documentation')} links={documentationLinks} />
          <FooterLinkList title={tFooter('community')} links={communityLinks} />
        </div>

        <div className="border-t border-[var(--color-border)] pt-[var(--spacing-md)]">
          <div className="text-center">
            <div className="text-xs leading-tight text-[var(--color-text-muted)]">
              {tFooter('copyright')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
