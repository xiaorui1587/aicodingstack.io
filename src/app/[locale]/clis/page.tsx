import { generateListPageMetadata } from '@/lib/metadata';
import CLIsPageClient from './page.client';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return await generateListPageMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'clis',
    translationNamespace: 'stacksPages.clis',
    additionalKeywords: ['Gemini CLI', 'GitHub Copilot CLI', 'command line AI tools'],
  });
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CLIsPage({ params }: Props) {
  const { locale } = await params;
  return <CLIsPageClient locale={locale} />;
}
