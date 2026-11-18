/**
 * Ruta (lab /order parts.tsx RouteTimeline, compact side-column version): the nalog's vehicle stops in driving order
 * (planned date ascending). Done stops are quieter with ✓ + when; the next one is tinted, marked „Sljedeće” and has
 * „✓ Potvrdi utovar / istovar”; the rest say how far away they are („sutra”, „za 3 dana”) or how late („Kasni 2
 * dana”). Undo is in the ⋯ of a done stop („Označi nedovršenom”, disabled with the reason when a later stop already
 * used the cargo — today's backend rules, checked up front). Own nalozi only: agency nalozi have no vehicle stops.
 */

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { STOP_KIND, type StopKind } from '@/components/shared/stop-kind';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Shipment } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useCompleteVehicleStop, useUncompleteVehicleStop, useUploadVehicleStopFile } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { daysFromToday, formatDateShort, formatDateTime, formatLate, formatRelativeDay } from '@/lib/utils/date';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { DONE_LINE, NEXT_STOP, STATUS_TEXT } from '../shared/tones';
import { uploadFiles as uploadWithLimit } from '../shared/upload';

/** The nalog's stops, planned date ascending (no date last), then by creation. */
export function sortStops(stops: VehicleStop[]) {
  return [...stops].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) return a.date.localeCompare(b.date);
    if (!a.date !== !b.date) return a.date ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function stopKinds(stop: VehicleStop, cargoIds: Set<string>): StopKind[] {
  return [
    ...(stop.loadingCargos.some((cargo) => cargoIds.has(cargo.id)) ? (['loading'] as const) : []),
    ...(stop.unloadingCargos.some((cargo) => cargoIds.has(cargo.id)) ? (['unloading'] as const) : []),
  ];
}

/** Why the stop can't be toggled now (same rules the backend enforces), or undefined. */
function blockedReason(stop: VehicleStop, stops: VehicleStop[]) {
  if (!stop.completedAt) {
    const notLoaded = stop.unloadingCargos.some((cargo) =>
      stops.some(
        (other) =>
          other.id !== stop.id && !other.completedAt && other.loadingCargos.some((item) => item.id === cargo.id)
      )
    );
    if (notLoaded) return 'Prvo potvrdi utovar ovog tereta.';
  } else {
    const laterDone = stop.loadingCargos.some((cargo) =>
      stops.some(
        (other) =>
          other.id !== stop.id && !!other.completedAt && other.unloadingCargos.some((item) => item.id === cargo.id)
      )
    );
    if (laterDone) return 'Teret je već istovaren. Prvo poništi taj istovar.';
  }
  return undefined;
}

function useToggleStop(stop: VehicleStop) {
  const { mutateAsync: complete, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncomplete, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);
  const place = stop.address?.placeName ?? undefined;

  async function toggle(kindLabel: string) {
    try {
      if (stop.completedAt) {
        await uncomplete();
        showSuccessToast({ title: `${kindLabel} označen nedovršenim`, description: place });
      } else {
        await complete();
        showSuccessToast({ title: `${kindLabel} potvrđen`, description: place });
      }
    } catch (error) {
      console.error(error);
      const errorCode = (error as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;
      if (errorCode === 'CARGO_NOT_YET_LOADED') {
        showErrorToast({
          title: 'Istovar nije potvrđen: teret još nije utovaren.',
          description: 'Prvo potvrdi utovar.',
        });
      } else if (errorCode === 'CARGO_STATUS_CHANGED_BY_LATER_STOP') {
        showErrorToast({
          title: 'Utovar nije poništen: teret je već istovaren.',
          description: 'Prvo poništi taj istovar.',
        });
      } else {
        showErrorToast({ title: 'Promjena nije spremljena. Pokušaj ponovno.' });
      }
    }
  }

  return { toggle, isPending: isCompleting || isUncompleting };
}

function DoneStopMenu({
  stop,
  shipmentId,
  reason,
  isPending,
  onUndo,
}: {
  stop: VehicleStop;
  shipmentId: string;
  reason?: string;
  isPending: boolean;
  onUndo(): void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { mutateAsync: upload } = useUploadVehicleStopFile(stop.id);
  const queryClient = useQueryClient();

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    const uploaded = await uploadWithLimit(files, (file) => upload({ file, fileName: file.name }));
    // The nalog lists its stops' files (Dokumenti, 📎 counts).
    if (uploaded > 0) void queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
  }

  return (
    <>
      <input className="hidden" multiple ref={fileInputRef} type="file" onChange={(event) => void handleFiles(event)} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button aria-label="Akcije" disabled={isPending} size="icon-sm" variant="ghost" />}
        >
          <Icon icon="IconDots" size="s" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem disabled={!!reason} onClick={onUndo}>
            <Icon icon="IconCircleX" size="s" /> Označi nedovršenom
          </DropdownMenuItem>
          {reason && <p className="px-2 pb-1.5 text-xs text-muted-foreground">{reason}</p>}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Icon icon="IconUpload" size="s" /> Dodaj dokument
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/dashboard/vehicle-stops/${stop.vehicleId}`} />}>
            <Icon icon="IconExternalLink" size="s" /> Otvori rutu vozila
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function StopRow({
  stop,
  shipmentId,
  stops,
  kinds,
  cargoNumbers,
  isNext,
  isLast,
}: {
  stop: VehicleStop;
  shipmentId: string;
  stops: VehicleStop[];
  kinds: StopKind[];
  cargoNumbers: number[];
  isNext: boolean;
  isLast: boolean;
}) {
  const { toggle, isPending } = useToggleStop(stop);
  const done = !!stop.completedAt;
  const days = stop.date ? daysFromToday(stop.date) : undefined;
  const late = !done && days !== undefined && days < 0;
  const reason = blockedReason(stop, stops);
  // A stop with both a loading and an unloading of this nalog is confirmed as one visit.
  const kindLabel = kinds.length === 1 && kinds[0] === 'unloading' ? 'Istovar' : 'Utovar';
  const confirmLabel = kinds.length === 1 && kinds[0] === 'unloading' ? 'Potvrdi istovar' : 'Potvrdi utovar';
  const place = stop.address;

  return (
    <li className="relative flex gap-4">
      {/* Marker + line to the next stop (solid once done, dashed while ahead). */}
      <div className="relative flex w-6 shrink-0 flex-col items-center">
        <span className="mt-0.5 flex size-6 items-center justify-center">
          {done ? (
            <Icon className={STATUS_TEXT.success} icon="IconCircleCheck" size="l" type="solid" />
          ) : late ? (
            <Icon className="text-destructive" icon="IconClockExclamation" size="l" />
          ) : (
            <span
              className={cn(
                'size-3.5 rounded-full border-2 bg-background',
                isNext ? NEXT_STOP.marker : 'border-muted-foreground/50'
              )}
            />
          )}
        </span>
        {!isLast && (
          <span
            className={cn(
              'mt-1 w-0.5 flex-1 rounded-full',
              done ? DONE_LINE : 'bg-[repeating-linear-gradient(to_bottom,var(--border)_0_5px,transparent_5px_9px)]'
            )}
          />
        )}
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-1',
          isLast ? 'pb-0' : 'pb-5',
          isNext && cn('-mx-3 -mt-2 mb-3 rounded-xl px-3 pt-2 pb-3', NEXT_STOP.row)
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {kinds.map((kind) => (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-semibold tracking-wide uppercase',
                done ? 'text-muted-foreground' : STOP_KIND[kind].text
              )}
              key={kind}
            >
              <Icon icon={STOP_KIND[kind].icon} size="s" />
              {STOP_KIND[kind].label}
            </span>
          ))}
          <span className="text-sm tabular-nums">
            {stop.date ? (
              formatDateShort(stop.date)
            ) : (
              <span className="font-medium text-destructive">Datum nedostaje</span>
            )}
          </span>
          {isNext && (
            <Badge look="solid" size="sm" tone="brand">
              Sljedeće
            </Badge>
          )}
          <span className="ml-auto flex items-center gap-2 text-xs">
            {done ? (
              <Tooltip>
                <TooltipTrigger render={<span className={cn('cursor-default', STATUS_TEXT.success)} />}>
                  Potvrđeno · {formatDateShort(stop.completedAt!)}
                </TooltipTrigger>
                <TooltipContent>Potvrđeno {formatDateTime(stop.completedAt!)}</TooltipContent>
              </Tooltip>
            ) : late ? (
              <span className="font-medium text-destructive">{formatLate(-(days ?? 0))}</span>
            ) : (
              stop.date && (
                <span className={isNext ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                  {formatRelativeDay(stop.date)}
                </span>
              )
            )}
            {done ? (
              <DoneStopMenu
                isPending={isPending}
                reason={reason}
                shipmentId={shipmentId}
                stop={stop}
                onUndo={() => void toggle(kindLabel)}
              />
            ) : (
              <Tooltip>
                {/* span: disabled buttons get no hover, the tooltip anchors on the wrapper */}
                <TooltipTrigger render={<span className="inline-flex" />}>
                  {isNext ? (
                    <Button
                      disabled={!!reason}
                      loading={isPending}
                      size="sm"
                      variant="outline"
                      onClick={() => void toggle(kindLabel)}
                    >
                      <Icon data-icon="inline-start" icon="IconCheck" size="s" /> {confirmLabel}
                    </Button>
                  ) : (
                    <Button
                      aria-label={confirmLabel}
                      disabled={!!reason}
                      loading={isPending}
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => void toggle(kindLabel)}
                    >
                      <Icon icon="IconCheck" size="s" />
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>{reason ?? confirmLabel}</TooltipContent>
              </Tooltip>
            )}
          </span>
        </div>
        <div className={cn('flex flex-col gap-1', done && 'opacity-70')}>
          <span className="flex min-w-0 items-baseline gap-2 text-sm">
            {place?.countryCode && <CountryFlag className="self-center" code={place.countryCode} size="xs" />}
            {place?.postalCode && <span className="text-muted-foreground tabular-nums">{place.postalCode}</span>}
            <span className="min-w-0 font-medium break-words">{place?.placeName ?? '—'}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {cargoNumbers.length === 1 ? 'Teret' : 'Tereti'} {cargoNumbers.join(', ')}
            {stop.documents.length > 0 && (
              <>
                {' · '}
                <Icon className="size-3.5! [&_svg]:size-full!" icon="IconPaperclip" size="xs" />
                {stop.documents.length}
              </>
            )}
          </span>
        </div>
      </div>
    </li>
  );
}

export function RouteTimeline({ shipment }: { shipment: Shipment }) {
  const cargoIds = React.useMemo(() => new Set(shipment.cargo.map((cargo) => cargo.id)), [shipment.cargo]);
  const stops = React.useMemo(() => sortStops(shipment.vehicleStops ?? []), [shipment.vehicleStops]);
  const nextIndex = stops.findIndex((stop) => !stop.completedAt);
  const cargoNumber = (id: string) => shipment.cargo.findIndex((cargo) => cargo.id === id) + 1;

  return (
    <ol className="flex flex-col">
      {stops.map((stop, index) => {
        const ids = [...stop.loadingCargos, ...stop.unloadingCargos]
          .map((cargo) => cargo.id)
          .filter((id, position, all) => cargoIds.has(id) && all.indexOf(id) === position);
        return (
          <StopRow
            cargoNumbers={ids.map(cargoNumber).sort((a, b) => a - b)}
            isLast={index === stops.length - 1}
            isNext={index === nextIndex}
            key={stop.id}
            kinds={stopKinds(stop, cargoIds)}
            shipmentId={shipment.id}
            stop={stop}
            stops={stops}
          />
        );
      })}
    </ol>
  );
}
