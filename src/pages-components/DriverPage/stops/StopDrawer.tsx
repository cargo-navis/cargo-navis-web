import dayjs from 'dayjs';

import { CountryFlag } from '@/components/shared/country-flag';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import type { DriverStop } from '@/lib/api/driver';

import { keepOpenOnToastPress, KIND_STYLES } from '../ui';
import { formatStopDate, getStopClientNames, getStopOrderNumbers, getStopTitle } from '../utils';
import { CompleteStopButton } from './CompleteStopButton';
import { DisponentContact } from './DisponentContact';
import { StopDetails } from './StopDetails';
import { StopDocuments } from './StopDocuments';

/**
 * The drawer title: the client when the stop serves one, else the place (the cargo sections name the companies), else
 * the order numbers (`Nalog #…`) for orders without a client.
 */
function getDrawerTitle(stop: DriverStop) {
  const clientNames = getStopClientNames(stop);
  if (clientNames.length === 1) return clientNames[0];
  if (clientNames.length > 1) return stop.address?.placeName ?? clientNames.join(', ');
  return getStopTitle(stop) ?? stop.address?.placeName ?? 'Bez adrese';
}

/** Kind badges, date, title and „place · order numbers”. */
const StopDrawerHeader: React.FC<{ stop: DriverStop; isNext: boolean }> = ({ stop, isNext }) => {
  const kinds = (['loading', 'unloading'] as const).filter((kind) =>
    kind === 'loading' ? stop.loadingCargos.length > 0 : stop.unloadingCargos.length > 0
  );
  // Without a client the order numbers are already the title, so they aren't repeated below it.
  const orderNumbers = getStopClientNames(stop).length > 0 ? getStopOrderNumbers(stop) : [];
  const description = [stop.address?.placeName, orderNumbers.join(' • ')].filter(Boolean).join(' · ');

  return (
    // No divider: header and body scroll together here, and the cargo sections' colour bar would sit on it.
    <DrawerHeader className="gap-1 p-4 not-last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        {kinds.map((kind) => (
          <Badge className={KIND_STYLES[kind].badge} key={kind} size="lg">
            {KIND_STYLES[kind].label}
          </Badge>
        ))}
        {isNext && (
          <Badge look="solid" size="lg" tone="brand">
            Sljedeća
          </Badge>
        )}
        <span className="text-sm font-medium text-foreground/80">{formatStopDate(stop.date, dayjs())}</span>
      </div>
      <DrawerTitle className="text-2xl [overflow-wrap:anywhere]">{getDrawerTitle(stop)}</DrawerTitle>
      {description && (
        <DrawerDescription className="flex items-center gap-1.5">
          {stop.address?.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
          <span>{description}</span>
        </DrawerDescription>
      )}
    </DrawerHeader>
  );
};

interface StopDrawerProps {
  /** Kept set while closing, so the content doesn't vanish during the slide-out. */
  stop: DriverStop | null;
  isNext: boolean;
  isOpen: boolean;
  onOpenChange(isOpen: boolean): void;
  /** A stop's confirmation was saved; the stop may no longer be the one on screen. */
  onStopCompleted(stopId: string): void;
}

/** A stop of the route: cargo, address with Navigacija, confirm, documents (📎, camera upload) and the dispatcher. */
export const StopDrawer: React.FC<StopDrawerProps> = ({ stop, isNext, isOpen, onOpenChange, onStopCompleted }) => (
  <Drawer open={isOpen} onOpenChange={keepOpenOnToastPress(onOpenChange)}>
    <DrawerContent>
      {stop && (
        // Keyed by stop: switching stops starts with fresh state (pending upload / delete, scroll position).
        <div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain" key={stop.id}>
          <StopDrawerHeader isNext={isNext} stop={stop} />
          <div className="flex flex-col gap-6 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <StopDetails
              actions={
                <>
                  <CompleteStopButton stop={stop} onCompleted={() => onStopCompleted(stop.id)} />
                  <StopDocuments key={stop.id} stop={stop} />
                  <DisponentContact disponent={stop.disponent} />
                </>
              }
              stop={stop}
            />
          </div>
        </div>
      )}
    </DrawerContent>
  </Drawer>
);
