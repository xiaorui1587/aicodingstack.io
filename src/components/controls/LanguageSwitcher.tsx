'use client';

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, localeLabels, type Locale } from '@/i18n/config';
import { useState, useEffect, useRef } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('footer');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Store the user's locale preference
    if (typeof window !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('aicodingstack-locale', newLocale);
    }

    // Get the current path without locale prefix
    // Check if pathname starts with a locale
    let pathnameWithoutLocale = pathname;
    locales.forEach((loc) => {
      if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
        pathnameWithoutLocale = pathname.slice(`/${loc}`.length) || '/';
      }
    });

    // Construct the new path
    let newPath: string;
    if (newLocale === 'en') {
      // For English (default locale), navigate to root path without locale prefix
      newPath = pathnameWithoutLocale;
    } else {
      // For other locales, add the locale prefix
      newPath = `/${newLocale}${pathnameWithoutLocale}`;
    }

    // Use window.location for more reliable navigation in production
    if (typeof window !== 'undefined') {
      window.location.href = newPath;
    } else {
      router.push(newPath);
      router.refresh();
    }

    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-block w-auto px-[var(--spacing-sm)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors text-xs font-light tracking-tight text-left"
        aria-label={t('selectLanguage')}
        aria-expanded={isOpen}
      >
        🌐 {localeLabels[locale]}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 min-w-[120px] bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-xs hover:bg-[var(--color-hover)] transition-colors ${
                loc === locale
                  ? 'bg-[var(--color-hover)] font-medium'
                  : 'font-light'
              }`}
            >
              {localeLabels[loc]}
              {loc === locale && ' ✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
