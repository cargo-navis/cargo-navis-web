import { Fragment } from 'react';

import { cn } from '@/lib/utils';
import { Icon, type IconType } from '@/ui';

export type DriverTab = 'stops' | 'shipments';

const TABS: { key: DriverTab; label: string; icon: IconType }[] = [
  { key: 'stops', label: 'Ruta', icon: 'IconRoute' },
  { key: 'shipments', label: 'Nalozi', icon: 'IconClipboardText' },
];

interface DriverTabsProps {
  activeTab: DriverTab;
  onChange(tab: DriverTab): void;
}

// Bottom tab bar, in thumb reach like a native app. 60px + 1px border; the pinned next stop and the toasts sit above it.
export const DriverTabs: React.FC<DriverTabsProps> = ({ activeTab, onChange }) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-[480px]" role="tablist">
        {TABS.map(({ key, label, icon }, index) => {
          const isActive = key === activeTab;
          return (
            <Fragment key={key}>
              {index > 0 && <div className="my-3 w-px bg-border" />}
              <button
                aria-selected={isActive}
                className={cn(
                  'flex h-[60px] grow basis-0 flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'text-brand' : 'text-muted-foreground'
                )}
                role="tab"
                type="button"
                onClick={() => onChange(key)}
              >
                <Icon icon={icon} size="l" />
                <span className={cn('text-[11px]', isActive ? 'font-bold' : 'font-medium')}>{label}</span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
};
