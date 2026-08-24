import clsx from 'clsx';

import { Box, FlexLayout, Text } from '@/ui';

import type { AnalyticsPageTab } from './hooks';

interface AnalyticsPageTabsProps {
  tab: AnalyticsPageTab;
  setTab: (tab: AnalyticsPageTab) => void;
}

const TABS: { key: AnalyticsPageTab; label: string }[] = [
  { key: 'overview', label: 'Ukupno' },
  { key: 'regular', label: 'Vlastiti prijevoz' },
  { key: 'agency', label: 'Agencijski nalozi' },
];

export const AnalyticsPageTabs = ({ tab, setTab }: AnalyticsPageTabsProps) => (
  <FlexLayout className="gap-1 border-b border-dark-200 dark:border-light-800">
    {TABS.map((t) => {
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
          <Text color="text-color-2" variant={isActive ? 'text-s-medium' : 'text-s'}>
            {t.label}
          </Text>
        </Box>
      );
    })}
  </FlexLayout>
);
