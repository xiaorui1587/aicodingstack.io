'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import LanguageSwitcher from './controls/LanguageSwitcher';
import { useTranslations } from 'next-intl';

function Footer() {
  const { theme, toggleTheme } = useTheme();
  const tFooter = useTranslations('footer');
  const tCommunity = useTranslations('community');
  const tStacks = useTranslations('stacks');
  const tNav = useTranslations('header');

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Define resource links
  const resourceLinks = [
    { href: '/ides', label: tStacks('ides') },
    { href: '/clis', label: tStacks('clis') },
    { href: '/extensions', label: tStacks('extensions') },
    { href: '/models', label: tStacks('models') },
    { href: '/model-providers', label: tStacks('modelProviders') },
    { href: '/vendors', label: tStacks('vendors') },
  ];

  // Define documentation links
  const documentationLinks = [
    { href: '/docs', label: tNav('docs') },
    { href: '/articles', label: tNav('articles') },
    { href: '/curated-collections', label: tNav('curatedCollections') },
    { href: '/#faq', label: tFooter('faq') },
  ];

  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] py-[var(--spacing-xl)] pb-[var(--spacing-md)]">
      <div className="max-w-[1200px] mx-auto px-[var(--spacing-md)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-[var(--spacing-lg)] mb-[var(--spacing-lg)]">
          <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-3">
            <h4 className="text-sm font-semibold tracking-tight">{tFooter('aicodingstack')}</h4>
            <p className="text-sm pb-[var(--spacing-sm)] leading-relaxed text-[var(--color-text-secondary)] font-light">
              {tFooter('tagline')}
              <br /><br />
              {tFooter('openSource')}
            </p>
            <div className="flex gap-[var(--spacing-xs)]">
              <button
                onClick={handleToggleTheme}
                className="inline-block w-auto px-[var(--spacing-sm)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors text-xs font-light tracking-tight text-left"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? `◐ ${tFooter('darkMode')}` : `◑ ${tFooter('lightMode')}`}
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-2">
            <h4 className="text-sm font-semibold tracking-tight">{tFooter('resources')}</h4>
            <ul className="flex flex-col gap-[var(--spacing-xs)] list-none">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-2">
            <h4 className="text-sm font-semibold tracking-tight">{tFooter('documentation')}</h4>
            <ul className="flex flex-col gap-[var(--spacing-xs)] list-none">
              {documentationLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-2">
            <h4 className="text-sm font-semibold tracking-tight">{tFooter('community')}</h4>
            <ul className="flex flex-col gap-[var(--spacing-xs)] list-none">
              <li>
                <a href="https://github.com/aicodingstack/aicodingstack" target="_blank" rel="noopener" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-light">
                  {tCommunity('github')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-light">
                  {tCommunity('discord')}
                </a>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-light">
                  {tCommunity('twitter')}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[var(--color-border)] pt-[var(--spacing-md)]">
          <div className="text-center">
            <div className="text-[0.625rem] leading-tight text-[var(--color-text-muted)]">
              {tFooter('copyright')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
