import clsx from 'clsx';
import dayjs from 'dayjs';

import { CountryFlag } from '@/components/countries';
import type { DriverStop, DriverStopCargo } from '@/lib/api/driver';
import { Box, FlexLayout, Icon, type IconSize, type IconType, Text } from '@/ui';

import {
  formatCargoTotals,
  formatStopDate,
  getStopClientNames,
  getStopClientsByKind,
  getStopOrderNumbers,
  getStopOrders,
  getStopTitle,
  getStopWhen,
  type StopOrder,
} from '../utils';

/**
 * How a stop card reads in the route: `next` is the stop to drive to (teal, white text), `completed` is history
 * (faded), `default` is a stop ahead.
 */
export type StopTone = 'default' | 'next' | 'completed';

// Same convention as the dispatcher dashboard: utovar = orange, istovar = teal.
const KIND_BADGE_CLASSES = {
  loading:
    'border-orange-500/30 bg-orange-50 text-orange-600 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-200',
  unloading: 'border-teal-500/30 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900 dark:text-teal-200',
};

// White text needs teal-600 or darker to stay readable (about 4.7:1); teal-500 is too light.
/** A completed stop or order: barely tinted green, so history reads as done without standing out. */
export const COMPLETED_CARD_CLASSES = 'border-0 bg-green-50/40 shadow-sm dark:border-light-850 dark:bg-green-900/20';

const CARD_CLASSES: Record<StopTone, string> = {
  default: 'border-dark-100 bg-white shadow-sm dark:border-light-850 dark:bg-light-875',
  next: 'border-teal-600 bg-teal-600 shadow-md dark:border-teal-700 dark:bg-teal-700',
  completed: COMPLETED_CARD_CLASSES,
};

// Same icons and colours as the drawer's utovar/istovar sections. On the teal card they take the lightest shades, the
// only ones the thin outline icons stay visible in (about 3.7:1 and 4.3:1 against teal-600).
const ORDER_KIND_STYLES: Record<
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

const KindBadge: React.FC<{ kind: StopOrder['kind'] }> = ({ kind }) => (
  <Text className={clsx('rounded-l border px-2 py-[2px]', KIND_BADGE_CLASSES[kind])} variant="text-xxxs-medium">
    {kind === 'loading' ? 'UTOVAR' : 'ISTOVAR'}
  </Text>
);

/** One order in the drawer header of a stop with several: what happens to it here, its client and its number. */
const StopOrderRow: React.FC<StopOrder> = ({ kind, shipment }) => {
  const { icon, color, label } = ORDER_KIND_STYLES[kind];

  return (
    <FlexLayout className="items-start gap-2">
      <FlexLayout className="h-[32px] shrink-0 items-center">
        <Icon aria-label={label} color={color} icon={icon} size="m" />
      </FlexLayout>
      <Text className="min-w-0 grow" color="text-color-1" variant="text-m-bold">
        {shipment.clientName ?? `Nalog #${shipment.orderNumber}`}
      </Text>
      {shipment.clientName && (
        <FlexLayout className="h-[32px] shrink-0 items-center">
          <Text color="text-color-3" variant="text-xs">
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
  showDate?: boolean;
}

/** Badges, client, place and orders for the stop drawer header. Companies are in the cargo sections. */
export const StopSummary: React.FC<StopSummaryProps> = ({ stop, isNext, showDate }) => {
  const title = getStopTitle(stop);
  // Several orders get a row each (client next to its own order number); one order keeps the client as the title.
  const orders = getStopOrders(stop);
  const hasOrderRows = orders.length > 1;
  // Without a client the order numbers are already the title, so they aren't repeated below it.
  const orderNumbers = !hasOrderRows && getStopClientNames(stop).length > 0 ? getStopOrderNumbers(stop) : [];

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
      {hasOrderRows ? (
        <FlexLayout className="flex-col gap-1">
          {orders.map((order) => (
            <StopOrderRow {...order} key={`${order.kind}-${order.shipment.id}`} />
          ))}
        </FlexLayout>
      ) : (
        title && (
          <Text className="[overflow-wrap:anywhere]" color="text-color-1" variant="text-l-bold">
            {title}
          </Text>
        )
      )}
      <FlexLayout className="items-start gap-[6px]">
        {stop.address?.countryCode && (
          <Box className="mt-[6px] flex shrink-0">
            <CountryFlag code={stop.address.countryCode} size="xxs" />
          </Box>
        )}
        <Text color="text-color-3" variant="text-xs">
          {[stop.address?.placeName, orderNumbers.join(' • ')].filter(Boolean).join(' • ')}
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};

/** Marks a stop or an order that has documents. */
export const DocumentsIcon: React.FC<{ isOnTeal?: boolean; size?: IconSize }> = ({ isOnTeal, size = 's' }) => (
  <Icon
    aria-label="Ima dokumente"
    color={isOnTeal ? 'text-white' : 'text-dark-400 dark:text-light-500'}
    icon="IconFileCheck"
    size={size}
  />
);

/** The documents icon at the end of a line of text, after a separating dot. */
export const DocumentsIndicator = () => (
  <FlexLayout className="h-[24px] shrink-0 items-center gap-[6px]">
    <Text color="text-color-3" variant="text-xs">
      •
    </Text>
    <DocumentsIcon />
  </FlexLayout>
);

// "Done" text and checks: a stop's confirmation day and time, a completed order's title.
export const COMPLETED_COLOR = 'text-green-600 dark:text-green-500';

/** Coloured small caps saying what happens at the stop: `UTOVAR`, `ISTOVAR` or both. */
const KindLine: React.FC<{ stop: DriverStop; isOnTeal: boolean }> = ({ stop, isOnTeal }) => {
  const kinds = (['loading', 'unloading'] as const).filter((kind) =>
    kind === 'loading' ? stop.loadingCargos.length > 0 : stop.unloadingCargos.length > 0
  );

  return (
    <FlexLayout className="items-center gap-1">
      {kinds.map((kind, index) => {
        const { color, onTealColor } = ORDER_KIND_STYLES[kind];
        return (
          <FlexLayout className="items-center gap-1" key={kind}>
            {index > 0 && (
              <Text color={isOnTeal ? 'text-light-100' : 'text-color-3'} variant="text-xxxs-bold">
                ·
              </Text>
            )}
            <Text color={isOnTeal ? onTealColor : color} variant="text-xxxs-bold">
              {kind === 'loading' ? 'UTOVAR' : 'ISTOVAR'}
            </Text>
          </FlexLayout>
        );
      })}
    </FlexLayout>
  );
};

/**
 * A card's clients of one kind, cut short to fit, with their cargo totals (`14 palete · 9.300 kg`) below; the icon
 * only when the stop both loads and unloads.
 */
const KindClientsLine: React.FC<{
  kind: StopOrder['kind'];
  names: string[];
  cargos: DriverStopCargo[];
  isOnTeal: boolean;
  showIcon: boolean;
}> = ({ kind, names, cargos, isOnTeal, showIcon }) => {
  const totals = formatCargoTotals(cargos);
  const { icon, color, onTealColor, label } = ORDER_KIND_STYLES[kind];
  return (
    <FlexLayout className="min-w-0 flex-col">
      <FlexLayout className="items-center gap-2">
        {showIcon && (
          <Icon aria-label={label} className="shrink-0" color={isOnTeal ? onTealColor : color} icon={icon} size="s" />
        )}
        <Text className="min-w-0 truncate" color={isOnTeal ? 'text-light-50' : 'text-color-2'} variant="text-s-medium">
          {names.join(', ')}
        </Text>
      </FlexLayout>
      {totals && (
        <Text
          className={clsx(showIcon && 'pl-[24px]')}
          color={isOnTeal ? 'text-light-100' : 'text-color-4'}
          variant="text-xs"
        >
          {totals}
        </Text>
      )}
    </FlexLayout>
  );
};

interface StopCardProps {
  stop: DriverStop;
  tone: StopTone;
  isHighlighted: boolean;
  onOpen(): void;
}

/**
 * A stop in the route: what happens there, the city with its clients below and when (the day of the confirmation or
 * of a stop ahead). Clients get a line per kind, without order numbers (`Nalog #…` names an order without a client);
 * the drawer has the numbers. A completed stop gets a light green background and a check before its day.
 */
export const StopCard: React.FC<StopCardProps> = ({ stop, tone, isHighlighted, onOpen }) => {
  const isOnTeal = tone === 'next';
  const isCompleted = tone === 'completed';
  const clientsByKind = getStopClientsByKind(stop);
  const when = getStopWhen(stop, dayjs());
  const primaryColor = isOnTeal ? 'text-white' : when.isLate ? 'text-red-600 dark:text-red-400' : 'text-color-1';

  return (
    <Box className={clsx('rounded-l border', CARD_CLASSES[tone], isHighlighted && 'card-highlight-fade')}>
      <FlexLayout
        aria-haspopup="dialog"
        as="button"
        className="w-full items-center gap-3 p-4 text-left"
        type="button"
        onClick={onOpen}
      >
        <FlexLayout className={clsx('min-w-0 grow items-center gap-3', isCompleted && 'opacity-60')}>
          <FlexLayout className="min-w-0 grow flex-col">
            <FlexLayout className="items-center gap-[6px]">
              <KindLine isOnTeal={isOnTeal} stop={stop} />
              {stop.documents.length > 0 && <DocumentsIcon isOnTeal={isOnTeal} size="s" />}
            </FlexLayout>
            <FlexLayout className="items-center gap-2">
              {stop.address?.countryCode && (
                <Box className="flex shrink-0">
                  <CountryFlag code={stop.address.countryCode} size="xs" />
                </Box>
              )}
              <Text className="min-w-0 truncate" color={isOnTeal ? 'text-white' : 'text-color-1'} variant="text-l-bold">
                {stop.address?.placeName ?? 'Bez adrese'}
              </Text>
            </FlexLayout>
            <FlexLayout className="flex-col">
              {clientsByKind.map(({ kind, names, cargos }) => (
                <KindClientsLine
                  cargos={cargos}
                  isOnTeal={isOnTeal}
                  key={kind}
                  kind={kind}
                  names={names}
                  showIcon={clientsByKind.length > 1}
                />
              ))}
            </FlexLayout>
          </FlexLayout>
          <FlexLayout className="shrink-0 flex-col items-end">
            <FlexLayout className="items-center gap-1">
              {isCompleted && <Icon aria-label="Potvrđeno" color={COMPLETED_COLOR} icon="IconCircleCheck" size="s" />}
              <Text color={isCompleted ? COMPLETED_COLOR : primaryColor} variant="text-s-bold">
                {when.primary}
              </Text>
            </FlexLayout>
            {when.secondary && (
              <Text color={isCompleted ? COMPLETED_COLOR : isOnTeal ? 'text-white' : 'text-color-3'} variant="text-xxs">
                {when.secondary}
              </Text>
            )}
          </FlexLayout>
        </FlexLayout>
      </FlexLayout>
    </Box>
  );
};
