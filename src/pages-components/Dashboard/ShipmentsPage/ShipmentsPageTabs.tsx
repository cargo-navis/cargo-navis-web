import clsx from 'clsx';

import { Box, FlexLayout, Text } from '@/ui';

import type { ShipmentsPageTab } from './hooks';

interface ShipmentsPageTabsProps {
  tab: ShipmentsPageTab;
  setTab: (tab: ShipmentsPageTab) => void;
  readyDraftsCount: number;
}

interface TabConfig {
  key: ShipmentsPageTab;
  label: string;
  badge?: number;
}

export const ShipmentsPageTabs: React.FC<ShipmentsPageTabsProps> = ({ tab, setTab, readyDraftsCount }) => {
  const tabs: TabConfig[] = [
    { key: 'shipments', label: 'Nalozi' },
    { key: 'drafts', label: 'Nacrti', badge: readyDraftsCount || undefined },
  ];

  return (
    <FlexLayout className="gap-1 border-b border-dark-200 dark:border-light-800">
      {tabs.map((t) => {
        const isActive = t.key === tab;
        return (
          <Box
            as="button"
            className={clsx(
              'relative px-4 py-3 outline-none -mb-px border-b-2 transition-colors',
              isActive
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-dark-700 dark:text-light-200 hover:text-teal-500'
            )}
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
          >
            <FlexLayout className="items-center gap-2">
              <Text color="text-color-2" variant={isActive ? 'text-s-medium' : 'text-s'}>
                {t.label}
              </Text>
              {!!t.badge && (
                <FlexLayout className="w-[24px] h-[24px] rounded-m bg-teal-500 items-center justify-center">
                  <Text className="font-mono" color="text-white" variant="text-xxs-medium">
                    {t.badge}
                  </Text>
                </FlexLayout>
              )}
            </FlexLayout>
          </Box>
        );
      })}
    </FlexLayout>
  );
};
