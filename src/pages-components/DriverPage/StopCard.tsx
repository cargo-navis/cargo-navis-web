import clsx from 'clsx';
import dayjs from 'dayjs';

import { CountryFlag } from '@/components/countries';
import type { DriverStop } from '@/lib/api/driver';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { StopDetails } from './StopDetails';
import { formatStopDate, getStopCompanyName } from './utils';

interface StopCardProps {
  stop: DriverStop;
  isExpanded: boolean;
  isHighlighted: boolean;
  isNext?: boolean;
  /** Day dividers already show the date on the timeline; only standalone lists need it on the card. */
  showDate?: boolean;
  onToggle(): void;
  actions?: React.ReactNode;
}

// Same convention as the dispatcher dashboard: utovar = orange, istovar = teal.
const KIND_BADGE_CLASSES = {
  loading:
    'border-orange-500/30 bg-orange-50 text-orange-600 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-200',
  unloading: 'border-teal-500/30 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900 dark:text-teal-200',
};

const KindBadge: React.FC<{ kind: 'loading' | 'unloading' }> = ({ kind }) => (
  <Text className={clsx('rounded-l border px-2 py-[2px]', KIND_BADGE_CLASSES[kind])} variant="text-xxxs-medium">
    {kind === 'loading' ? 'UTOVAR' : 'ISTOVAR'}
  </Text>
);

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  isExpanded,
  isHighlighted,
  isNext,
  showDate,
  onToggle,
  actions,
}) => {
  const companyName = getStopCompanyName(stop);
  const orderNumbers = Array.from(
    new Set([...stop.loadingCargos, ...stop.unloadingCargos].map((cargo) => `#${cargo.shipment.orderNumber}`))
  );
  const isCompleted = Boolean(stop.completedAt);

  return (
    <Box
      className={clsx(
        'rounded-l border border-dark-100 bg-white shadow-sm dark:border-light-850 dark:bg-light-875',
        isHighlighted && 'card-highlight-fade'
      )}
      data-stop-id={stop.id}
    >
      <FlexLayout
        aria-expanded={isExpanded}
        as="button"
        className="w-full flex-col gap-1 p-4 text-left"
        type="button"
        onClick={onToggle}
      >
        <FlexLayout className="w-full items-center justify-between gap-2">
          <FlexLayout className="items-center gap-2">
            {stop.loadingCargos.length > 0 && <KindBadge kind="loading" />}
            {stop.unloadingCargos.length > 0 && <KindBadge kind="unloading" />}
            {isNext && (
              <Text
                className="rounded-l bg-teal-700 px-2 py-[2px] text-white dark:bg-teal-600"
                variant="text-xxxs-medium"
              >
                SLJEDEĆA
              </Text>
            )}
            {showDate && (
              <Text color="text-color-2" variant="text-xs-medium">
                {formatStopDate(stop.date, dayjs())}
              </Text>
            )}
          </FlexLayout>
          <FlexLayout className="items-center gap-2">
            {isCompleted && <Icon color="text-green-600" icon="IconCircleCheck" size="m" />}
            <Icon
              color="text-dark-500 dark:text-light-300"
              icon={isExpanded ? 'IconChevronUp' : 'IconChevronDown'}
              size="m"
            />
          </FlexLayout>
        </FlexLayout>
        {companyName && (
          <Text color="text-color-1" variant="text-s-medium">
            {companyName}
          </Text>
        )}
        <FlexLayout className="items-center gap-[6px]">
          {stop.address?.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
          <Text color="text-color-3" variant="text-xs">
            {[stop.address?.placeName, orderNumbers.join(' • ')].filter(Boolean).join(' • ')}
          </Text>
        </FlexLayout>
      </FlexLayout>
      {isExpanded && (
        <Box className="border-t border-dark-100 p-4 dark:border-light-850">
          <StopDetails actions={actions} showSideBars stop={stop} />
        </Box>
      )}
    </Box>
  );
};
