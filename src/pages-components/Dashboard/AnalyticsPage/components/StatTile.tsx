import clsx from 'clsx';
import type { ReactNode } from 'react';

import { FlexLayout, Icon, IconType, Text } from '@/ui';

interface TileStyle {
  /** Icon and label colour. */
  accent: string;
  /** Gradient stops laid over the card background. */
  gradient: string;
}

const DEFAULT_TILE_STYLE: TileStyle = {
  accent: 'text-dark-600 dark:text-light-300',
  gradient: '',
};

// Keyed by icon so the same metric reads the same colour on every tab, and matches
// the dashboard cards where the icon is already in use.
const TILE_STYLES: Partial<Record<IconType, TileStyle>> = {
  IconFileDescription: {
    accent: 'text-blue-600',
    gradient: 'from-transparent from-45% to-blue-600/15',
  },
  IconChartBar: {
    accent: 'text-teal-600',
    gradient: 'from-transparent from-45% to-teal-600/15',
  },
  IconCashBanknote: {
    accent: 'text-green-600',
    gradient: 'from-transparent from-45% to-green-600/15',
  },
  IconCashBanknoteOff: {
    accent: 'text-red-500 dark:text-red-300',
    gradient: 'from-transparent from-45% to-red-500/15',
  },
  IconTrendingUp: {
    accent: 'text-teal-600',
    gradient: 'from-transparent from-45% to-teal-600/15',
  },
};

interface StatTileProps {
  icon: IconType;
  label: string;
  value: ReactNode;
  /** Rendered inline after the value, e.g. "/ mj.". */
  hint?: ReactNode;
  /** Rendered on its own row below the value, e.g. the agency share of a total. */
  note?: ReactNode;
}

export const StatTile = ({ icon, label, value, hint, note }: StatTileProps) => {
  const { accent, gradient } = TILE_STYLES[icon] ?? DEFAULT_TILE_STYLE;

  return (
    <FlexLayout
      className={clsx(
        'flex-col flex-1 gap-2 p-4 items-baseline justify-between border border-dark-100 dark:border-light-900 shadow-md rounded-m',
        'bg-white dark:bg-white-alpha-10 bg-gradient-to-tr',
        gradient
      )}
    >
      <FlexLayout className="items-center gap-2">
        <Icon color={accent} icon={icon} size="l" />
        <Text color={accent} variant="text-m">
          {label}
        </Text>
      </FlexLayout>
      <Text color="text-color-1" variant="text-xl-bold">
        {value}
        {hint ? (
          <>
            {' '}
            <Text as="small" color="text-color-3" variant="text-m">
              {hint}
            </Text>
          </>
        ) : null}
      </Text>
      {note ? (
        <Text color="text-color-3" variant="text-xs">
          {note}
        </Text>
      ) : null}
    </FlexLayout>
  );
};
