import { generateComparisonMetadata } from '@/lib/metadata';
import ModelComparisonPageClient from './page.client';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  return await generateComparisonMetadata({
    locale: locale as 'en' | 'zh-Hans',
    category: 'models',
  });
}

export default async function ModelComparisonPage({ params }: Props) {
  const { locale } = await params;
  return <ModelComparisonPageClient locale={locale} />;
}
