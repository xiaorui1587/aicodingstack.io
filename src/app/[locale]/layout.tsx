import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { WebVitals } from "./web-vitals";
import { JsonLd } from "@/components/JsonLd";
import { locales, type Locale } from '@/i18n/config';

// Reduced font weights from 4 to 2 for better performance
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: 'swap',
  preload: true,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  // Load translations for metadata
  const messages = await getMessages({ locale });
  const siteMessages = messages.site as Record<string, string> | undefined;

  const title = siteMessages?.title || "AI Coding Stack - Your AI Coding Ecosystem Hub";
  const description = siteMessages?.description || "Comprehensive directory for AI coding tools. Discover, compare and explore IDEs, CLIs, MCP servers, models and providers.";

  // Map locale to OpenGraph locale format
  const ogLocale = locale === 'zh-Hans' ? 'zh_CN' : 'en_US';

  return {
    metadataBase: new URL('https://aicodingstack.io'),
    title,
    description,
    keywords: [
      'AI coding tools',
      'AI code editor',
      'AI IDE',
      'AI coding assistant',
      'AI CLI',
      'MCP servers',
      'LLM models',
      'AI coding directory',
      'coding tools comparison',
    ].join(', '),
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
      languages: {
        'en': '/',
        'zh-Hans': '/zh-Hans',
      },
    },
    appleWebApp: {
      capable: true,
      title: 'AI Coding Stack',
      statusBarStyle: 'default',
    },
    // Resource hints for better performance
    other: {
      'x-dns-prefetch-control': 'on',
    },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      url: locale === 'en' ? 'https://aicodingstack.io' : `https://aicodingstack.io/${locale}`,
      siteName: 'AI Coding Stack',
      title,
      description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'AI Coding Stack - Your AI Coding Ecosystem Hub',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@aicodingstack',
      creator: '@aicodingstack',
      title,
      description,
      images: ['/twitter-card.png'],
    },
  };
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Coding Stack",
  "url": "https://aicodingstack.io",
  "logo": "https://aicodingstack.io/logo.png",
  "description": "Comprehensive directory and community-maintained metadata repository for AI-powered coding tools, models, and platforms.",
  "foundingDate": "2025",
  "sameAs": [
    "https://github.com/ericyangpan/aicodingstack"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://github.com/ericyangpan/aicodingstack/issues"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI Coding Stack",
  "url": "https://aicodingstack.io",
  "description": "Comprehensive directory for AI coding tools across IDEs, CLIs, MCP servers, models and providers.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://aicodingstack.io/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Theme initialization script (inline for performance) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('aicodingstack-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Structured Data */}
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body
        className={`${ibmPlexMono.variable} font-mono antialiased bg-[var(--color-bg)] text-[var(--color-text)]`}
      >
        <NextIntlClientProvider messages={messages}>
          <ClientLayout>
            {children}
          </ClientLayout>
          <WebVitals />
        </NextIntlClientProvider>
      </body>
      {/* Load GA after page interactive for better performance */}
      {process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId="G-P6Y3S6L23P" />
      )}
    </html>
  );
}
