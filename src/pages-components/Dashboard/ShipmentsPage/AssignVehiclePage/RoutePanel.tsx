import { CountryFlag } from '@/components/shared/country-flag';
import { DriverAvatar } from '@/components/shared/driver-avatar';
import { Panel } from '@/components/shared/panel';
import { STOP_KIND, type StopKind } from '@/components/shared/stop-kind';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { LoadingAddress } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Icon } from '@/ui';

import { CLASH_ROW, TODAY_LINE } from '../shared/tones';
import type { VehicleRow } from './pickers';
import { type NewStop, stopKinds, timelineOf } from './route';

/** Halo of a new stop's pulsing dot, in its kind's colour (the `stop-pulse` keyframes, globals.css). */
const HALO: Record<StopKind, string> = { loading: 'var(--utovar-dot)', unloading: 'var(--istovar-dot)' };

function KindLabels({ kinds, done }: { kinds: StopKind[]; done?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      {kinds.map((kind) => (
        <span
          className={cn(
            'text-xs font-medium tracking-wide uppercase',
            done ? 'text-muted-foreground' : STOP_KIND[kind].text
          )}
          key={kind}
        >
          {STOP_KIND[kind].label}
        </span>
      ))}
    </span>
  );
}

/** New stop marker: a dot in its kind's colour with a soft radial halo that grows and fades. */
function PulseDot({ kind }: { kind: StopKind }) {
  return (
    <span className="relative z-10 flex size-7 shrink-0 items-center justify-center">
      <span
        className="absolute inset-0 rounded-full opacity-0 motion-safe:animate-[stop-pulse_1.2s_ease-out_infinite]"
        style={{ background: `radial-gradient(circle, ${HALO[kind]} 0%, transparent 70%)` }}
      />
      <span className={cn('relative size-3 rounded-full', STOP_KIND[kind].dot)} />
    </span>
  );
}

const orderNumbersOf = (stop: VehicleStop) => [
  ...new Set(
    [...stop.loadingCargos, ...stop.unloadingCargos].map((cargo) => cargo.shipment?.orderNumber).filter(Boolean)
  ),
];

/**
 * „Ruta KC 123-AB” (lab `TimelinePanel`): the selected vehicle's last 3 done stops, the planned ones and the new ones
 * („Novo · #2057”, pulsing dot) by date, a „Danas” line; planned stops on the new days are marked „Isti dan”.
 */
export function RoutePanel({
  row,
  driverId,
  driverName,
  newStops,
  orderNumber,
  today,
  loading,
  stopLabel,
}: {
  row?: VehicleRow;
  driverId?: string;
  driverName?: string;
  newStops: NewStop[];
  orderNumber: string;
  today: string;
  loading: boolean;
  stopLabel(key: string): { address: LoadingAddress; companyName?: string } | undefined;
}) {
  if (!row) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        <Icon icon="IconTruck" size="l" />
        Odaberi vozilo da vidiš njegovu rutu.
      </div>
    );
  }

  const items = timelineOf(row.stops, newStops, today);

  return (
    <Panel
      title={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            Ruta <span className="font-mono">{row.vehicle.registration}</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
            {driverId && <DriverAvatar driverId={driverId} name={driverName} size="sm" />}
            {driverName ?? 'bez vozača'}
          </span>
        </span>
      }
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-12 rounded-lg" key={index} />
          ))}
        </div>
      ) : (
        <ol className="flex flex-col">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            if (item.type === 'today') {
              return (
                <li className={cn('flex items-center gap-2 py-2 text-xs font-medium', TODAY_LINE.text)} key="today">
                  Danas · {formatDateShort(item.date)}
                  <span className={cn('h-px flex-1', TODAY_LINE.rule)} />
                </li>
              );
            }

            if (item.type === 'new') {
              const label = stopLabel(item.stop.key);
              return (
                <li className="relative flex gap-3" key={`new-${item.stop.key}`}>
                  <span className="flex flex-col items-center">
                    <PulseDot kind={item.stop.kinds[0]} />
                    {!last && <span className="w-px grow bg-border" />}
                  </span>
                  <div className="mb-2 flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg bg-primary/5 px-3 py-2 text-sm ring-1 ring-primary/30 dark:bg-primary/15">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="w-12 shrink-0 text-xs tabular-nums">{formatDateShort(item.stop.date!)}</span>
                      <KindLabels kinds={item.stop.kinds} />
                      <Badge size="sm" tone="brand">
                        Novo · #{orderNumber}
                      </Badge>
                    </span>
                    {label && (
                      <span className="flex min-w-0 items-center gap-1.5 pl-14">
                        {label.address.countryCode && <CountryFlag code={label.address.countryCode} size="xxs" />}
                        <span className="truncate">
                          {[label.address.postalCode, label.address.placeName].filter(Boolean).join(' ')}
                        </span>
                        {label.companyName && (
                          <span className="truncate text-xs text-muted-foreground">· {label.companyName}</span>
                        )}
                      </span>
                    )}
                  </div>
                </li>
              );
            }

            const { stop, clash } = item;
            const done = isStopCompleted(stop);
            const kinds = stopKinds(stop);
            const orders = orderNumbersOf(stop);
            return (
              <li className="relative flex gap-3" key={stop.id}>
                <span className="flex flex-col items-center">
                  <span
                    className={cn(
                      'z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-card',
                      done ? 'text-muted-foreground' : STOP_KIND[kinds[0]].text
                    )}
                  >
                    <Icon
                      className="size-3.5! [&_svg]:size-full!"
                      icon={done ? 'IconCheck' : STOP_KIND[kinds[0]].icon}
                      size="xs"
                    />
                  </span>
                  {!last && <span className="w-px grow bg-border" />}
                </span>
                <div
                  className={cn(
                    'mb-2 flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg px-3 py-2 text-sm',
                    clash && CLASH_ROW,
                    done && 'text-muted-foreground'
                  )}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="w-12 shrink-0 text-xs tabular-nums">
                      {stop.date ? formatDateShort(stop.date) : 'Bez datuma'}
                    </span>
                    <KindLabels done={done} kinds={kinds} />
                    {clash && (
                      <Badge size="sm" tone="warning">
                        Isti dan
                      </Badge>
                    )}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 pl-14">
                    {stop.address?.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
                    <span className="truncate">
                      {[stop.address?.postalCode, stop.address?.placeName].filter(Boolean).join(' ') || '—'}
                    </span>
                    {orders.length > 0 && (
                      <span className="truncate text-xs text-muted-foreground">
                        · {orders.map((order) => `#${order}`).join(', ')}
                      </span>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
