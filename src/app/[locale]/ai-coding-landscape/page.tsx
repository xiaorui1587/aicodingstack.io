import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, buildTitle } from '@/lib/metadata';
import LandscapePage from './components/LandscapePage';
import {
  buildVendorMatrix,
  buildRelationshipGraph,
  getProductsByCategory,
  calculateLandscapeStats,
} from '@/lib/landscape-data';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'header' });

  const canonicalPath = locale === 'en' ? '/ai-coding-landscape' : `/${locale}/ai-coding-landscape`;
  const title = buildTitle({ title: tNav('aiCodingLandscape') });
  const description = tNav('aiCodingLandscapeDesc');

  return {
    title,
    description,
    keywords: 'AI coding ecosystem, AI development landscape, AI tools, coding tools visualization, vendor comparison, product matrix',
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/ai-coding-landscape',
        'zh-Hans': '/zh-Hans/ai-coding-landscape',
      },
    },
    openGraph: buildOpenGraph({
      title: tNav('aiCodingLandscape'),
      description,
      url: buildCanonicalUrl({ path: canonicalPath, locale }),
      locale,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      title: tNav('aiCodingLandscape'),
      description,
    }),
  };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'header' });
  const tOverview = await getTranslations({ locale, namespace: 'stacksPages.overview' });

  // Build all data for the landscape page
  const matrixData = buildVendorMatrix();
  const graphData = buildRelationshipGraph();
  const productsByCategory = getProductsByCategory();
  const stats = calculateLandscapeStats();

  const translations = {
    title: tNav('aiCodingLandscape'),
    description: tNav('aiCodingLandscapeDesc'),
    backTitle: tOverview('overviewTitle'),
  };

  return (
    <>
      <Header />
      <LandscapePage
        matrixData={matrixData}
        graphData={graphData}
        productsByCategory={productsByCategory}
        stats={stats}
        locale={locale}
        translations={translations}
      />
      <Footer />
    </>
  );
}
