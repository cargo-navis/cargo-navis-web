import clsx from 'clsx';
import dayjs from 'dayjs';

import { CountryFlag } from '@/components/countries';
import type { DriverStop } from '@/lib/api/driver';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { formatStopDate, getStopCompanyName } from '../utils';

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

interface StopSummaryProps {
  stop: DriverStop;
  isNext?: boolean;
  /** Day dividers already show the date on the timeline; only standalone lists need it. */
  showDate?: boolean;
  /** Cards mark stops with documents; the sheet lists them instead. */
  showDocumentsIndicator?: boolean;
}

/** Badges, company and place; shared by the stop card and the stop drawer header. */
export const StopSummary: React.FC<StopSummaryProps> = ({ stop, isNext, showDate, showDocumentsIndicator }) => {
  const companyName = getStopCompanyName(stop);
  const orderNumbers = Array.from(
    new Set([...stop.loadingCargos, ...stop.unloadingCargos].map((cargo) => `#${cargo.shipment.orderNumber}`))
  );

  return (
    <FlexLayout className="min-w-0 flex-col gap-1 text-left">
      <FlexLayout className="flex-wrap items-center gap-2">
        {stop.loadingCargos.length > 0 && <KindBadge kind="loading" />}
        {stop.unloadingCargos.length > 0 && <KindBadge kind="unloading" />}
        {isNext && (
          <Text className="rounded-l bg-teal-700 px-2 py-[2px] text-white dark:bg-teal-600" variant="text-xxxs-medium">
            SLJEDEĆA
          </Text>
        )}
        {showDate && (
          <Text color="text-color-2" variant="text-xs-medium">
            {formatStopDate(stop.date, dayjs())}
          </Text>
        )}
      </FlexLayout>
      {companyName && (
        <Text color="text-color-1" variant="text-s-medium">
          {companyName}
        </Text>
      )}
      <FlexLayout className="items-start gap-[6px]">
        {/* Centered on the first 24px text line, so it stays put when the line wraps. */}
        {stop.address?.countryCode && (
          <Box className="mt-[6px] flex shrink-0">
            <CountryFlag code={stop.address.countryCode} size="xxs" />
          </Box>
        )}
        <Text color="text-color-3" variant="text-xs">
          {[stop.address?.placeName, orderNumbers.join(' • ')].filter(Boolean).join(' • ')}
        </Text>
        {showDocumentsIndicator && stop.documents.length > 0 && <DocumentsIndicator />}
      </FlexLayout>
    </FlexLayout>
  );
};

export const DocumentsIndicator = () => (
  <FlexLayout className="h-[24px] shrink-0 items-center gap-[6px]">
    <Text color="text-color-3" variant="text-xs">
      •
    </Text>
    <Icon aria-label="Ima dokumente" color="text-dark-400 dark:text-light-500" icon="IconFile" size="s" />
  </FlexLayout>
);

interface StopCardProps extends StopSummaryProps {
  isHighlighted: boolean;
  onOpen(): void;
}

export const StopCard: React.FC<StopCardProps> = ({ stop, isHighlighted, isNext, showDate, onOpen }) => (
  <Box
    className={clsx(
      'rounded-l border border-dark-100 bg-white shadow-sm dark:border-light-850 dark:bg-light-875',
      isHighlighted && 'card-highlight-fade'
    )}
    data-stop-id={stop.id}
  >
    <FlexLayout
      aria-haspopup="dialog"
      as="button"
      className="w-full items-center justify-between gap-2 p-4"
      type="button"
      onClick={onOpen}
    >
      <StopSummary isNext={isNext} showDate={showDate} showDocumentsIndicator stop={stop} />
      <FlexLayout className="shrink-0 items-center gap-2">
        {stop.completedAt && <Icon color="text-green-600" icon="IconCircleCheck" size="m" />}
        <Icon color="text-dark-500 dark:text-light-300" icon="IconChevronRight" size="m" />
      </FlexLayout>
    </FlexLayout>
  </Box>
);
