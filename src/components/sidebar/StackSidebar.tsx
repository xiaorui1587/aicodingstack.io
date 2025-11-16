'use client';

import { useMemo, memo } from 'react';
import Sidebar, { SidebarItem } from './Sidebar';
import { useTranslations } from 'next-intl';
import { stackCounts } from '@/lib/generated/metadata';

type StackId = 'overview' | 'ides' | 'clis' | 'extensions' | 'models' | 'model-providers' | 'vendors';

interface StackSidebarProps {
  activeStack?: StackId;
  locale: string;
}

function StackSidebar({ activeStack, locale }: StackSidebarProps) {
  const tStacks = useTranslations('stacks');
  const tStackSidebar = useTranslations('components.stackSidebar');

  const items: SidebarItem[] = useMemo(() => {
    const stacks = [
      { id: 'ides' as StackId, title: tStacks('ides'), path: `/${locale}/ides` },
      { id: 'clis' as StackId, title: tStacks('clis'), path: `/${locale}/clis` },
      { id: 'extensions' as StackId, title: tStacks('extensions'), path: `/${locale}/extensions` },
      { id: 'models' as StackId, title: tStacks('models'), path: `/${locale}/models` },
      { id: 'model-providers' as StackId, title: tStacks('modelProviders'), path: `/${locale}/model-providers` },
      { id: 'vendors' as StackId, title: tStacks('vendors'), path: `/${locale}/vendors` },
    ];

    return [
      { id: 'overview', title: tStackSidebar('overview'), href: `/${locale}/ai-coding-stack` },
      ...stacks.map((stack) => ({
        id: stack.id,
        title: stack.title,
        href: stack.path,
        count: stackCounts[stack.id] || 0,
      })),
    ];
  }, [locale, tStacks, tStackSidebar]);

  const icon = (
    <svg
      className="w-5 h-5 text-[var(--color-text-muted)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );

  return (
    <Sidebar
      items={items}
      activeId={activeStack || 'overview'}
      title={tStackSidebar('title')}
      label={tStackSidebar('label')}
      icon={icon}
      desktopWidth="lg:w-[256px]"
    />
  );
}

export default memo(StackSidebar);
