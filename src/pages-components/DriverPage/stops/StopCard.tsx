import clsx from 'clsx';
import dayjs from 'dayjs';

import { CountryFlag } from '@/components/countries';
import type { DriverStop } from '@/lib/api/driver';
import { Box, FlexLayout, Icon, type IconType, Text } from '@/ui';

import {
  formatMoreOrders,
  formatStopDate,
  getStopClientNames,
  getStopOrderNumbers,
  getStopOrders,
  getStopTitle,
  type StopOrder,
} from '../utils';

/**
 * How a stop card reads in the route: `next` is the stop to drive to (teal, white text), `completed` is history
 * (dimmed), `default` is everything else and the drawer header.
 */
export type StopTone = 'default' | 'next' | 'completed';

// Same convention as the dispatcher dashboard: utovar = orange, istovar = teal. On the teal card they turn white.
const KIND_BADGE_CLASSES = {
  loading:
    'border-orange-500/30 bg-orange-50 text-orange-600 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-200',
  unloading: 'border-teal-500/30 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900 dark:text-teal-200',
};
const NEXT_KIND_BADGE_CLASSES = {
  loading: 'border-white bg-white text-orange-600',
  unloading: 'border-white bg-white text-teal-700',
};

// White text needs teal-600 or darker to stay readable (about 4.7:1); teal-500 is too light.
const CARD_CLASSES: Record<StopTone, string> = {
  default: 'border-dark-100 bg-white shadow-sm dark:border-light-850 dark:bg-light-875',
  next: 'border-teal-600 bg-teal-600 shadow-md dark:border-teal-700 dark:bg-teal-700',
  completed: 'border-dark-100 bg-transparent dark:border-light-850',
};

const KindBadge: React.FC<{ kind: 'loading' | 'unloading'; tone: StopTone }> = ({ kind, tone }) => (
  <Text
    className={clsx(
      'rounded-l border px-2 py-[2px]',
      (tone === 'next' ? NEXT_KIND_BADGE_CLASSES : KIND_BADGE_CLASSES)[kind]
    )}
    variant="text-xxxs-medium"
  >
    {kind === 'loading' ? 'UTOVAR' : 'ISTOVAR'}
  </Text>
);

// Same icons and colours as the drawer's utovar/istovar sections. On the teal card they take the lightest shades, the
// only ones the thin outline icons stay visible in (about 3.7:1 and 4.3:1 against teal-600).
const ORDER_KIND_ICONS: Record<
  StopOrder['kind'],
  { icon: IconType; color: string; onTealColor: string; label: string }
> = {
  loading: {
    icon: 'IconPackageImport',
    color: 'text-orange-500 dark:text-orange-400',
    onTealColor: 'text-orange-200',
    label: 'Utovar',
  },
  unloading: {
    icon: 'IconPackageExport',
    color: 'text-teal-500 dark:text-teal-400',
    onTealColor: 'text-teal-100',
    label: 'Istovar',
  },
};

/** One order of a stop with several: what happens to it here, its client and its number. */
const StopOrderRow: React.FC<StopOrder & { isOnTeal: boolean; isCompact: boolean }> = ({
  kind,
  shipment,
  isOnTeal,
  isCompact,
}) => {
  const { icon, color, onTealColor, label } = ORDER_KIND_ICONS[kind];
  return (
    <FlexLayout className="items-start gap-2">
      {/* Icon and number sit in boxes as tall as the name's first line (text-m: 32px), so they're centred on it and
          stay put when a name wraps. */}
      <FlexLayout className="h-[32px] shrink-0 items-center">
        <Icon aria-label={label} color={isOnTeal ? onTealColor : color} icon={icon} size="m" />
      </FlexLayout>
      <Text
        className={clsx('min-w-0 grow', isCompact && 'truncate')}
        color={isOnTeal ? 'text-white' : 'text-color-1'}
        variant="text-m-bold"
      >
        {shipment.clientName ?? `Nalog #${shipment.orderNumber}`}
      </Text>
      {shipment.clientName && (
        <FlexLayout className="h-[32px] shrink-0 items-center">
          <Text color={isOnTeal ? 'text-white' : 'text-color-3'} variant="text-xs">
            #{shipment.orderNumber}
          </Text>
        </FlexLayout>
      )}
    </FlexLayout>
  );
};

interface StopSummaryProps {
  stop: DriverStop;
  isNext?: boolean;
  tone?: StopTone;
  /**
   * Cards cap the order rows of a stop with several orders: past this many, the last row becomes "+ još N naloga".
   * The drawer header lists them all.
   */
  maxOrderRows?: number;
  /** The route shows day labels above the cards; only the drawer header needs the date. */
  showDate?: boolean;
  /** Cards mark stops with documents; the sheet lists them instead. */
  showDocumentsIndicator?: boolean;
}

/** Badges, client, place and orders; shared by the stop card and the stop drawer header. Companies are in the cargo sections. */
export const StopSummary: React.FC<StopSummaryProps> = ({
  stop,
  isNext,
  tone = 'default',
  maxOrderRows,
  showDate,
  showDocumentsIndicator,
}) => {
  const isOnTeal = tone === 'next';
  const title = getStopTitle(stop);
  // Several orders get a row each (client next to its own order number); one order keeps the client as the title.
  const orders = getStopOrders(stop);
  const hasOrderRows = orders.length > 1;
  const visibleOrders = maxOrderRows && orders.length > maxOrderRows ? orders.slice(0, maxOrderRows - 1) : orders;
  const hiddenOrdersCount = orders.length - visibleOrders.length;
  // Without a client the order numbers are already the title, so they aren't repeated below it.
  const orderNumbers = !hasOrderRows && getStopClientNames(stop).length > 0 ? getStopOrderNumbers(stop) : [];

  return (
    // History fades as a whole (text, badges and flag), so the route ahead stands out.
    <FlexLayout className={clsx('min-w-0 flex-col gap-1 text-left', tone === 'completed' && 'opacity-60')}>
      <FlexLayout className="flex-wrap items-center gap-2">
        {stop.loadingCargos.length > 0 && <KindBadge kind="loading" tone={tone} />}
        {stop.unloadingCargos.length > 0 && <KindBadge kind="unloading" tone={tone} />}
        {isNext && (
          <Text
            className={clsx(
              'rounded-l border px-2 py-[2px] text-white',
              isOnTeal ? 'border-white' : 'border-teal-700 bg-teal-700 dark:border-teal-600 dark:bg-teal-600'
            )}
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
      {hasOrderRows ? (
        <FlexLayout className="flex-col gap-1">
          {visibleOrders.map((order) => (
            <StopOrderRow
              {...order}
              isCompact={!!maxOrderRows}
              isOnTeal={isOnTeal}
              key={`${order.kind}-${order.shipment.id}`}
            />
          ))}
          {hiddenOrdersCount > 0 && (
            <Text className="pl-7" color={isOnTeal ? 'text-white' : 'text-color-3'} variant="text-xs-medium">
              {formatMoreOrders(hiddenOrdersCount)}
            </Text>
          )}
        </FlexLayout>
      ) : (
        title && (
          <Text color={isOnTeal ? 'text-white' : 'text-color-1'} variant="text-l-bold">
            {title}
          </Text>
        )
      )}
      <FlexLayout className="items-start gap-[6px]">
        {/* Centered on the first 24px text line, so it stays put when the line wraps. */}
        {stop.address?.countryCode && (
          <Box className="mt-[6px] flex shrink-0">
            <CountryFlag code={stop.address.countryCode} size="xxs" />
          </Box>
        )}
        <Text color={isOnTeal ? 'text-white' : 'text-color-3'} variant="text-xs">
          {[stop.address?.placeName, orderNumbers.join(' • ')].filter(Boolean).join(' • ')}
        </Text>
        {showDocumentsIndicator && stop.documents.length > 0 && <DocumentsIndicator isOnTeal={isOnTeal} />}
      </FlexLayout>
    </FlexLayout>
  );
};

export const DocumentsIndicator: React.FC<{ isOnTeal?: boolean }> = ({ isOnTeal }) => (
  <FlexLayout className="h-[24px] shrink-0 items-center gap-[6px]">
    <Text color={isOnTeal ? 'text-white' : 'text-color-3'} variant="text-xs">
      •
    </Text>
    <Icon
      aria-label="Ima dokumente"
      color={isOnTeal ? 'text-white' : 'text-dark-400 dark:text-light-500'}
      icon="IconFile"
      size="s"
    />
  </FlexLayout>
);

interface StopCardProps extends Pick<StopSummaryProps, 'stop' | 'isNext' | 'tone'> {
  isHighlighted: boolean;
  onOpen(): void;
}

export const StopCard: React.FC<StopCardProps> = ({ stop, isHighlighted, isNext, tone = 'default', onOpen }) => (
  <Box className={clsx('rounded-l border', CARD_CLASSES[tone], isHighlighted && 'card-highlight-fade')}>
    <FlexLayout aria-haspopup="dialog" as="button" className="w-full p-4" type="button" onClick={onOpen}>
      <StopSummary isNext={isNext} maxOrderRows={3} showDocumentsIndicator stop={stop} tone={tone} />
    </FlexLayout>
  </Box>
);
