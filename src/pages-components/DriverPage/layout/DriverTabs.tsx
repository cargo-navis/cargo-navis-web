import clsx from 'clsx';
import { Fragment } from 'react';

import { FlexLayout, Icon, type IconType, Text, VerticalDivider } from '@/ui';

export type DriverTab = 'stops' | 'shipments';

const TABS: { key: DriverTab; label: string; icon: IconType }[] = [
  { key: 'stops', label: 'Ruta', icon: 'IconRoute' },
  { key: 'shipments', label: 'Nalozi', icon: 'IconClipboardText' },
];

interface DriverTabsProps {
  activeTab: DriverTab;
  onChange(tab: DriverTab): void;
}

// Bottom tab bar, in thumb reach like a native app.
export const DriverTabs: React.FC<DriverTabsProps> = ({ activeTab, onChange }) => {
  return (
    <FlexLayout
      as="nav"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-dark-100 bg-white pb-[env(safe-area-inset-bottom)] dark:border-light-850 dark:bg-light-875"
    >
      <FlexLayout className="mx-auto w-full max-w-[480px]" role="tablist">
        {TABS.map(({ key, label, icon }, index) => {
          const isActive = key === activeTab;
          return (
            <Fragment key={key}>
              {index > 0 && (
                <FlexLayout className="py-3">
                  <VerticalDivider bgColor="bg-dark-100 dark:bg-light-850" />
                </FlexLayout>
              )}
              <FlexLayout
                aria-selected={isActive}
                as="button"
                className={clsx(
                  'h-[60px] grow basis-0 flex-col items-center justify-center gap-[2px] transition-colors',
                  isActive ? 'text-teal-700 dark:text-teal-300' : 'text-dark-500 dark:text-light-300'
                )}
                role="tab"
                type="button"
                onClick={() => onChange(key)}
              >
                <Icon icon={icon} size="l" />
                <Text variant={isActive ? 'text-xxxs-bold' : 'text-xxxs-medium'}>{label}</Text>
              </FlexLayout>
            </Fragment>
          );
        })}
      </FlexLayout>
    </FlexLayout>
  );
};
