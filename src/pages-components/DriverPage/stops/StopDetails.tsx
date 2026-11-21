import dayjs from 'dayjs';

import type { StopKind } from '@/components/shared/stop-kind';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { DriverStop, DriverStopCargo } from '@/lib/api/driver';
import { cn } from '@/lib/utils';
import { getCargoLabel } from '@/lib/utils/cargo';
import { Icon } from '@/ui';

import { COMPLETED_TEXT, KIND_STYLES, SectionTitle } from '../ui';
import {
  formatCargoMeasures,
  formatCargoTotals,
  formatCompletedAt,
  getNavigationUrl,
  groupCargosByShipment,
} from '../utils';

interface StopDetailsProps {
  stop: DriverStop;
  /**
   * Inside the order drawer's timeline: no colour bar on the left edge (the timeline has its own line), no
   * confirmation time in the section titles (the timeline says it once for the stop) and no order number per section
   * (the drawer is about that one order).
   */
  isInTimeline?: boolean;
  actions?: React.ReactNode;
}

function unique(values: (string | null)[]) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

/** Street and place with the map button (Google Maps navigation; icon only, as before the redesign). */
const AddressRow: React.FC<{ stop: DriverStop }> = ({ stop }) => {
  const { address } = stop;
  if (!address) return null;
  const navigationUrl = getNavigationUrl(address);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col text-sm text-muted-foreground">
        {address.streetName && <span>{address.streetName}</span>}
        <span>
          {[address.postalCode, address.placeName].filter(Boolean).join(' ')}
          {address.countryCode ? `, ${address.countryCode}` : ''}
        </span>
      </div>
      {navigationUrl && (
        <Button
          aria-label="Navigacija"
          className="shrink-0"
          nativeButton={false}
          render={<a href={navigationUrl} rel="noopener noreferrer" target="_blank" title="Navigacija" />}
          size="icon-xl"
          variant="outline"
        >
          <Icon icon="IconMap2" size="m" />
        </Button>
      )}
    </div>
  );
};

/**
 * What happens to the cargo of one kind at the stop: per order the company at the site (else the client), the order
 * number with its totals, references, every cargo and the dispatcher's notes. Utovar orange / istovar teal, green with
 * a check once confirmed.
 */
const CargoSection: React.FC<{
  kind: StopKind;
  stop: DriverStop;
  cargos: DriverStopCargo[];
  isInTimeline?: boolean;
  children?: React.ReactNode;
}> = ({ kind, stop, cargos, isInTimeline, children }) => {
  const style = KIND_STYLES[kind];
  const isLoading = kind === 'loading';
  const { completedAt } = stop;

  return (
    <div className={cn('relative flex flex-col gap-3', !isInTimeline && '-ml-4 pl-4')}>
      {!isInTimeline && (
        <div className={cn('absolute inset-y-0 left-0 w-1 rounded-r-[4px]', completedAt ? 'bg-success' : style.bar)} />
      )}
      <SectionTitle
        className={completedAt ? COMPLETED_TEXT : style.text}
        icon={completedAt ? 'IconCircleCheck' : style.icon}
      >
        {style.label}
        {completedAt && !isInTimeline && ` · potvrđeno ${formatCompletedAt(completedAt, dayjs())}`}
      </SectionTitle>
      {groupCargosByShipment(cargos).map(({ shipment, cargos: shipmentCargos }) => {
        const companies = unique(
          shipmentCargos.map((cargo) => (isLoading ? cargo.loadingCompanyName : cargo.unloadingCompanyName))
        );
        const company = companies.join(', ') || shipment.clientName;
        const references = unique(
          shipmentCargos.map((cargo) => (isLoading ? cargo.loadingReference : cargo.unloadingReference))
        );
        const descriptions = unique(
          shipmentCargos.map((cargo) => (isLoading ? cargo.loadingDescription : cargo.unloadingDescription))
        );
        const totals = formatCargoTotals(shipmentCargos);
        // The order drawer is about one order: its number is already in the header.
        const orderLine = [!isInTimeline && `Nalog #${shipment.orderNumber}`, totals].filter(Boolean).join(' · ');

        return (
          <div className="flex flex-col gap-0.5" key={shipment.id}>
            {company && <span className="font-medium [overflow-wrap:anywhere]">{company}</span>}
            {orderLine && <span className="text-sm text-muted-foreground">{orderLine}</span>}
            {references.length > 0 && (
              <span className="text-sm text-muted-foreground">Ref: {references.join(', ')}</span>
            )}
            <ul className="text-sm text-foreground/80">
              {shipmentCargos.map((cargo) => (
                <li className="list-inside list-disc" key={cargo.id}>
                  {[getCargoLabel(cargo), ...formatCargoMeasures(cargo)].join(' · ')}
                </li>
              ))}
            </ul>
            {descriptions.map((description) => (
              <Alert className="mt-1.5" key={description} size="sm">
                <AlertDescription className="whitespace-pre-line">{description}</AlertDescription>
              </Alert>
            ))}
          </div>
        );
      })}
      {children}
    </div>
  );
};

/**
 * The stop's cargo sections (utovar first) with the address and Navigacija in the first one, then the actions
 * (confirm, documents, dispatcher).
 */
export const StopDetails: React.FC<StopDetailsProps> = ({ stop, isInTimeline, actions }) => {
  const sections = (
    [
      ['loading', stop.loadingCargos],
      ['unloading', stop.unloadingCargos],
    ] as const
  ).filter(([, cargos]) => cargos.length > 0);

  return (
    <div className={cn('flex flex-col', isInTimeline ? 'gap-4' : 'gap-6')}>
      {sections.length === 0 && <AddressRow stop={stop} />}
      {sections.map(([kind, cargos], index) => (
        <CargoSection cargos={cargos} isInTimeline={isInTimeline} key={kind} kind={kind} stop={stop}>
          {index === 0 && <AddressRow stop={stop} />}
        </CargoSection>
      ))}
      {actions}
    </div>
  );
};
