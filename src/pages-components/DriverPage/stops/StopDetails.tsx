import clsx from 'clsx';
import dayjs from 'dayjs';

import type { DriverStop, DriverStopCargo } from '@/lib/api/driver';
import { getCargoLabel } from '@/lib/utils/cargo';
import { Alert, Box, FlexLayout, Icon, type IconType, Text } from '@/ui';

import { formatCargoMeasures, formatCompletedAt, getNavigationUrl, groupCargosByShipment } from '../utils';

interface StopDetailsProps {
  stop: DriverStop;
  hideShipmentHeaders?: boolean;
  /** Coloured utovar/istovar bar on the card's left edge; only for full-width cards, not inside the shipment timeline. */
  showSideBars?: boolean;
  actions?: React.ReactNode;
}

function unique(values: (string | null)[]) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

// Same convention as the dispatcher dashboard: utovar = orange, istovar = teal (500 light / 400 dark).
const SIDE_STYLES: Record<
  'loading' | 'unloading',
  { title: string; icon: IconType; color: string; line: string; bar: string }
> = {
  loading: {
    title: 'UTOVAR',
    icon: 'IconPackageImport',
    color: 'text-orange-500 dark:text-orange-400',
    line: 'bg-orange-300 dark:bg-orange-700',
    bar: 'bg-orange-500 dark:bg-orange-400',
  },
  unloading: {
    title: 'ISTOVAR',
    icon: 'IconPackageExport',
    color: 'text-teal-500 dark:text-teal-400',
    line: 'bg-teal-300 dark:bg-teal-700',
    bar: 'bg-teal-500 dark:bg-teal-400',
  },
};

// A confirmed stop turns its sections green with a check and shows when it was confirmed, whatever the side.
const COMPLETED_STYLE = {
  icon: 'IconCircleCheck',
  color: 'text-green-600 dark:text-green-400',
  line: 'bg-green-300 dark:bg-green-700',
  bar: 'bg-green-600 dark:bg-green-400',
} satisfies Omit<(typeof SIDE_STYLES)['loading'], 'title'>;

const CargoSide: React.FC<{
  side: 'loading' | 'unloading';
  cargos: DriverStopCargo[];
  completedAt: string | null;
  hideShipmentHeaders?: boolean;
  showSideBar?: boolean;
}> = ({ side, cargos, completedAt, hideShipmentHeaders, showSideBar }) => {
  const isLoading = side === 'loading';
  const style = completedAt ? { ...SIDE_STYLES[side], ...COMPLETED_STYLE } : SIDE_STYLES[side];

  return (
    <FlexLayout className={clsx('relative flex-col gap-2', showSideBar && '-ml-4 pl-4')}>
      {showSideBar && <Box className={clsx('absolute inset-y-0 left-0 w-[4px] rounded-r-xs', style.bar)} />}
      <FlexLayout className={clsx('items-center gap-2', style.color)}>
        <Icon icon={style.icon} size="s" />
        <Text variant="text-xxxs-bold">{style.title}</Text>
        <Box className={clsx('h-[1px] grow', style.line)} />
        {completedAt && (
          <Text className="shrink-0" variant="text-xxxs-medium">
            {formatCompletedAt(completedAt, dayjs())}
          </Text>
        )}
      </FlexLayout>
      <FlexLayout className="flex-col gap-4">
        {groupCargosByShipment(cargos).map(({ shipment, cargos: shipmentCargos }) => {
          const references = unique(shipmentCargos.map((c) => (isLoading ? c.loadingReference : c.unloadingReference)));
          const descriptions = unique(
            shipmentCargos.map((c) => (isLoading ? c.loadingDescription : c.unloadingDescription))
          );

          return (
            <FlexLayout className={clsx('flex-col gap-1', completedAt && 'opacity-50')} key={shipment.id}>
              {!hideShipmentHeaders && (
                <Text color="text-color-1" variant="text-xs-medium">
                  Nalog #{shipment.orderNumber}
                </Text>
              )}
              {references.length > 0 && (
                <Text color="text-color-2" variant="text-xs">
                  Ref: {references.join(', ')}
                </Text>
              )}
              {shipmentCargos.map((cargo) => (
                <Text as="li" className="list-inside" color="text-color-2" key={cargo.id} variant="text-xs">
                  {[getCargoLabel(cargo), ...formatCargoMeasures(cargo)].join(' · ')}
                </Text>
              ))}
              {descriptions.map((description) => (
                <Alert
                  className="mt-1"
                  icon="IconInfoCircle"
                  key={description}
                  size="s"
                  text={<span className="whitespace-pre-line">{description}</span>}
                  variant="default"
                />
              ))}
            </FlexLayout>
          );
        })}
      </FlexLayout>
    </FlexLayout>
  );
};

export const StopDetails: React.FC<StopDetailsProps> = ({ stop, hideShipmentHeaders, showSideBars, actions }) => {
  const { address } = stop;
  const navigationUrl = getNavigationUrl(address);

  return (
    <FlexLayout className="flex-col gap-4">
      {address && (
        <FlexLayout className="items-start justify-between gap-3">
          <FlexLayout className="flex-col">
            {address.streetName && (
              <Text color="text-color-1" variant="text-xs">
                {address.streetName}
              </Text>
            )}
            <Text color="text-color-2" variant="text-xs">
              {[address.postalCode, address.placeName].filter(Boolean).join(' ')}
              {address.countryCode ? `, ${address.countryCode}` : ''}
            </Text>
          </FlexLayout>
          {navigationUrl && (
            <a
              aria-label="Navigiraj"
              className="flex size-[44px] shrink-0 items-center justify-center rounded-m border border-dark-200 text-dark-800 dark:border-light-800 dark:text-light-50"
              href={navigationUrl}
              rel="noopener noreferrer"
              target="_blank"
              title="Navigiraj"
            >
              <Icon icon="IconMap2" size="m" />
            </a>
          )}
        </FlexLayout>
      )}
      {stop.loadingCargos.length > 0 && (
        <CargoSide
          cargos={stop.loadingCargos}
          completedAt={stop.completedAt}
          hideShipmentHeaders={hideShipmentHeaders}
          showSideBar={showSideBars}
          side="loading"
        />
      )}
      {stop.unloadingCargos.length > 0 && (
        <CargoSide
          cargos={stop.unloadingCargos}
          completedAt={stop.completedAt}
          hideShipmentHeaders={hideShipmentHeaders}
          showSideBar={showSideBars}
          side="unloading"
        />
      )}
      {actions}
    </FlexLayout>
  );
};
