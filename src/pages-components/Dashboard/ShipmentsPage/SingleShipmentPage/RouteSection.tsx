/**
 * Ruta, the main column of the Nalog detail's Pregled (lab /order-route option A „Ruta kao glavni sadržaj”, decided
 * 2026-11-19): a vertical status timeline, one card per utovar / istovar in date order. Left the date and weekday, then
 * the marker on the line, then the card: UTOVAR / ISTOVAR (grey UTOVARENO / ISTOVARENO once done; the ONLY orange /
 * teal), place, company · street, tereti „T1 · 5,2 t · 8 pal”, reference, 📎 count, the utovar / istovar note.
 * Status colours are the quick look's (list/RouteStops + routeData): green ✓ + green line done, blue truck on the line
 * into the next stop when the vehicle is on its way, red clock (late utovar) / red truck (late istovar), hollow grey
 * not started.
 * - Own nalog with a vehicle: one row per vehicle stop (routeData buildVehicleRouteStops) — the stop's `completedAt`
 *   is done, and the next stop (first not done) is tinted, „Sljedeće”, with „✓ Potvrdi utovar / istovar”. Driver
 *   notice per stop (messageSentAt), done stops quieter with „Potvrđeno · when” (the API keeps no who). ⋯: „Označi
 *   nedovršenom” (disabled with the reason when a later stop already used the cargo), confirm out of order, Dodaj
 *   dokument, Otvori rutu vozila.
 * - Own nalog without a vehicle: the plan from the tereti (buildRouteStops), nothing to confirm yet.
 * - Agency nalog: „Relacija” + „Planirano s naloga.”, the dispatcher's hand marks exactly as the quick look's agency
 *   mode (useAgencyRoute): marked = green ✓ + green line, „Označeno ručno”; date passed and not marked = amber ring and
 *   tint, „Rok prošao · označi status”, the mark button amber; otherwise grey. „Označi utovareno / istovareno” on every
 *   unmarked stop, undo in ⋯. No truck, no red „Kasni”, no „Sljedeće”, no driver notices.
 */

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { STOP_KIND } from '@/components/shared/stop-kind';
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
import type { Cargo, Shipment } from '@/lib/api';
import { useCompleteVehicleStop, useUncompleteVehicleStop, useUploadVehicleStopFile } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import {
  daysFromToday,
  formatDateShort,
  formatDateTime,
  formatLate,
  formatRelativeDay,
  formatWeekday,
} from '@/lib/utils/date';
import { pluralCount } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import {
  agencyUndoBlocked,
  buildRouteStops,
  buildVehicleRouteStops,
  type Place,
  type RouteStopKind,
  type RouteStopState,
  toTrackCargo,
  type VehicleRouteStop,
} from '../list/routeData';
import {
  AgencyMarker,
  DONE_LABEL,
  MARK_LABEL,
  Marker,
  NEXT,
  OVERDUE_BUTTON,
  Segment,
  UNDO_LABEL,
  useAgencyRoute,
} from '../list/RouteStops';
import { isCustomCargo } from '../shared/cargo';
import { formatNumber } from '../shared/format';
import { NEXT_STOP_CARD, OVERDUE_STOP_CARD, STATUS_BAR, STATUS_TEXT } from '../shared/tones';
import { uploadFiles as uploadWithLimit } from '../shared/upload';

const UTOVARI = ['utovar', 'utovara', 'utovara'] as const;
const ISTOVARI = ['istovar', 'istovara', 'istovara'] as const;

/** One teret at a stop, on the side (utovar / istovar) it's handled there. */
interface Side {
  kind: RouteStopKind;
  cargo: Cargo;
}

const SIDE_FIELDS = {
  loading: { company: 'loadingCompanyName', reference: 'loadingReference', note: 'loadingDescription' },
  unloading: { company: 'unloadingCompanyName', reference: 'unloadingReference', note: 'unloadingDescription' },
} as const;

const unique = (values: (string | null | undefined)[]) => [
  ...new Set(values.map((value) => value?.trim()).filter((value): value is string => !!value)),
];

const sideValues = (sides: Side[], field: keyof (typeof SIDE_FIELDS)['loading']) =>
  unique(sides.map(({ kind, cargo }) => cargo[SIDE_FIELDS[kind][field]]));

/** „T1 · 5,2 t · 8 pal” (or „· izvanredni” for a teret with its own dimensions). */
function cargoChip(cargo: Cargo, number: number) {
  return [
    `T${number}`,
    cargo.weight ? `${formatNumber(cargo.weight / 1000)} t` : undefined,
    isCustomCargo(cargo) ? 'izvanredni' : `${cargo.metadata?.palleteAmount ?? 0} pal`,
  ]
    .filter(Boolean)
    .join(' · ');
}

// ---------------------------------------------------------------------------------------------------------------------
// Pieces shared by the own and the agency rows
// ---------------------------------------------------------------------------------------------------------------------

function RouteHeading({ title, summary, line }: { title: string; summary: string; line?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-heading text-base font-bold tracking-tight">{title}</h2>
        <span className="text-sm text-muted-foreground tabular-nums">{summary}</span>
      </div>
      {line && <p className="text-sm text-muted-foreground">{line}</p>}
    </div>
  );
}

/** „2 utovara · 1 istovar · 1 od 3 gotovo” (agency: „… označeno”). */
function countText(rows: { kinds: RouteStopKind[]; done: boolean }[], word: 'gotovo' | 'označeno') {
  const loadings = rows.filter((row) => row.kinds.includes('loading')).length;
  const unloadings = rows.filter((row) => row.kinds.includes('unloading')).length;
  const done = rows.filter((row) => row.done).length;
  return `${pluralCount(loadings, UTOVARI)} · ${pluralCount(unloadings, ISTOVARI)} · ${done} od ${rows.length} ${word}`;
}

/** Date column: „7.11.” + weekday; red when late (own nalozi only), grey once done. */
function DateCell({
  date,
  done,
  late,
  missing,
}: {
  date: string | null;
  done: boolean;
  late?: boolean;
  missing: React.ReactNode;
}) {
  if (!date) return <span className="flex min-h-5 items-center justify-end text-right text-xs">{missing}</span>;
  return (
    <span className="flex flex-col items-end gap-0.5 text-right">
      <span
        className={cn(
          'flex h-5 items-center text-sm tabular-nums',
          done ? 'text-muted-foreground' : 'font-semibold',
          late && 'text-destructive'
        )}
      >
        {formatDateShort(date)}
      </span>
      <span className="text-xs text-muted-foreground">{formatWeekday(date)}</span>
    </span>
  );
}

function KindWords({ kinds, done }: { kinds: RouteStopKind[]; done: boolean }) {
  return kinds.map((kind) => (
    <span
      className={cn(
        'text-xs leading-none font-semibold tracking-wide uppercase',
        done ? 'text-muted-foreground' : STOP_KIND[kind].text
      )}
      key={kind}
    >
      {done ? DONE_LABEL[kind] : STOP_KIND[kind].label}
    </span>
  ));
}

/** Place, company · street, tereti + ref + extra (📎), and the note — the card's body under the first line. */
function StopDetails({
  place,
  street,
  sides,
  cargoNumber,
  done,
  extra,
}: {
  place: Place | null;
  street?: string | null;
  sides: Side[];
  cargoNumber: Map<string, number>;
  done: boolean;
  extra?: React.ReactNode;
}) {
  const companies = sideValues(sides, 'company');
  const references = sideValues(sides, 'reference');
  const notes = sideValues(sides, 'note');
  const cargos = [...new Map(sides.map(({ cargo }) => [cargo.id, cargo])).values()];
  return (
    <>
      <span className="flex min-w-0 items-baseline gap-1.5 text-base">
        {place?.countryCode && <CountryFlag className="self-center" code={place.countryCode} size="xs" />}
        {place?.postalCode && <span className="shrink-0 text-muted-foreground tabular-nums">{place.postalCode}</span>}
        <span className={cn('min-w-0 break-words', done ? 'text-muted-foreground' : 'font-medium')}>
          {place?.placeName ?? '—'}
        </span>
      </span>
      {(companies.length > 0 || (street && !done)) && (
        <span className="text-sm">
          {companies.length > 0 && (
            <span className={done ? 'text-muted-foreground' : 'font-medium'}>{companies.join(', ')}</span>
          )}
          {street && !done && (
            <span className="text-muted-foreground">
              {companies.length > 0 && ' · '}
              {street}
            </span>
          )}
        </span>
      )}
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
        <span className="flex flex-wrap gap-1">
          {cargos.map((cargo) => (
            <Badge className={cn('tabular-nums', done && 'opacity-70')} key={cargo.id} look="outline" size="sm">
              {cargoChip(cargo, cargoNumber.get(cargo.id) ?? 0)}
            </Badge>
          ))}
        </span>
        {references.length > 0 && !done && (
          <span className="text-xs text-muted-foreground">Ref. {references.join(', ')}</span>
        )}
        {extra}
      </span>
      {notes.length > 0 && !done && (
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm whitespace-pre-wrap">{notes.join('\n')}</p>
      )}
    </>
  );
}

/**
 * One timeline row: date · rail (a short piece from above so the marker lines up with the card's first line, the
 * marker, the segment down to the next stop) · card with its actions on the right.
 */
function RouteRow({
  date,
  marker,
  fromAbove,
  segment,
  last,
  cardClassName,
  actions,
  children,
}: {
  date: React.ReactNode;
  marker: React.ReactNode;
  /** The line coming into this stop: green when it's done, grey otherwise, none for the first. */
  fromAbove?: 'done' | 'idle';
  segment?: React.ReactNode;
  last: boolean;
  cardClassName: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[4.25rem_1rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[5.5rem_1rem_minmax(0,1fr)]">
      <div className="pt-4">{date}</div>
      <div className="flex flex-col items-center">
        <span className={cn('h-4 w-0.5 shrink-0', fromAbove ? STATUS_BAR[fromAbove] : 'bg-transparent')} />
        <span className="flex h-5 shrink-0 items-center">{marker}</span>
        {segment}
      </div>
      <div className={cn('min-w-0', !last && 'pb-3')}>
        <div className={cn('flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start', cardClassName)}>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
          {actions && <div className="flex shrink-0 items-center gap-1 sm:-mt-1">{actions}</div>}
        </div>
      </div>
    </li>
  );
}

/** Disabled with the reason in a tooltip instead of failing after the click. */
function WithReason({ reason, children }: { reason?: string; children: React.ReactElement }) {
  if (!reason) return children;
  return (
    <Tooltip>
      {/* span: disabled buttons get no hover, the tooltip anchors on the wrapper */}
      <TooltipTrigger render={<span className="inline-flex" />}>{children}</TooltipTrigger>
      <TooltipContent className="max-w-64">{reason}</TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Own nalog with a vehicle: the vehicle stops
// ---------------------------------------------------------------------------------------------------------------------

const STOP_WORDS = {
  loading: { confirm: 'Potvrdi utovar', confirmed: 'Utovar potvrđen', undone: 'Utovar označen nedovršenim' },
  unloading: { confirm: 'Potvrdi istovar', confirmed: 'Istovar potvrđen', undone: 'Istovar označen nedovršenim' },
  // A stop with a utovar and an istovar of this nalog is one visit: confirmed together.
  both: {
    confirm: 'Potvrdi utovar i istovar',
    confirmed: 'Utovar i istovar potvrđeni',
    undone: 'Utovar i istovar označeni nedovršenima',
  },
} as const;

const wordsFor = (kinds: RouteStopKind[]) => STOP_WORDS[kinds.length > 1 ? 'both' : kinds[0]];

/** Confirm / undo a vehicle stop (today's ToggleStopCompletionButton rules and messages). */
function useToggleStop(row: VehicleRouteStop) {
  const { stop } = row;
  const { mutateAsync: complete, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncomplete, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);
  const words = wordsFor(row.kinds);
  const place = stop.address?.placeName ?? undefined;

  async function toggle() {
    try {
      if (stop.completedAt) {
        await uncomplete();
        showSuccessToast({ title: words.undone, description: place });
      } else {
        await complete();
        showSuccessToast({ title: words.confirmed, description: place });
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

  return { toggle, words, isPending: isCompleting || isUncompleting };
}

function VehicleStopMenu({
  row,
  shipmentId,
  isPending,
  confirmLabel,
  onToggle,
}: {
  row: VehicleRouteStop;
  shipmentId: string;
  isPending: boolean;
  confirmLabel: string;
  onToggle(): void;
}) {
  const { stop, blocked } = row;
  const done = row.state === 'done';
  // The next stop confirms with its button; any other stop can be toggled here.
  const toggles = done || !NEXT.includes(row.state);
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
          render={<Button aria-label="Više akcija" disabled={isPending} size="icon-sm" variant="ghost" />}
        >
          <Icon icon="IconDots" size="s" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {toggles && (
            <>
              <DropdownMenuItem disabled={!!blocked} onClick={onToggle}>
                <Icon icon={done ? 'IconCircleX' : 'IconCheck'} size="s" />
                {done ? 'Označi nedovršenom' : confirmLabel}
              </DropdownMenuItem>
              {blocked && <p className="px-2 pb-1.5 text-xs text-muted-foreground">{blocked}</p>}
              <DropdownMenuSeparator />
            </>
          )}
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

/** Next to the kind word: „Vozilo na putu · sutra”, „Kasni 2 dana”, „za 3 dana”; nothing once done. */
function OwnStatusText({ state, date, daysLate }: { state: RouteStopState; date: string | null; daysLate: number }) {
  if (state === 'done') return null;
  if (state === 'late') return <span className="text-xs font-medium text-destructive">{formatLate(daysLate)}</span>;
  // A planned stop whose date already passed says nothing here: the late next stop carries it.
  const when = date && daysFromToday(date) >= 0 ? formatRelativeDay(date) : undefined;
  if (state === 'transit')
    return (
      <span className={cn('text-xs', STATUS_TEXT.info)}>
        Vozilo na putu{when && <span className="text-muted-foreground"> · {when}</span>}
      </span>
    );
  if (!when) return null;
  return <span className={cn('text-xs', state === 'waiting' ? 'font-medium' : 'text-muted-foreground')}>{when}</span>;
}

function DocsCount({ documents }: { documents: { id: string; name: string }[] }) {
  if (!documents.length) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="flex cursor-default items-center gap-0.5 text-xs text-muted-foreground tabular-nums" />
        }
      >
        <Icon className="size-3.5! [&_svg]:size-full!" icon="IconPaperclip" size="xs" /> {documents.length}
      </TooltipTrigger>
      <TooltipContent className="max-w-72">
        <span className="flex flex-col">
          {documents.map((document) => (
            <span className="break-all" key={document.id}>
              {document.name}
            </span>
          ))}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

function VehicleStopRow({
  row,
  following,
  first,
  shipmentId,
  cargosById,
  cargoNumber,
}: {
  row: VehicleRouteStop;
  following?: VehicleRouteStop;
  first: boolean;
  shipmentId: string;
  cargosById: Map<string, Cargo>;
  cargoNumber: Map<string, number>;
}) {
  const { stop, state, kinds } = row;
  const { toggle, words, isPending } = useToggleStop(row);
  const done = state === 'done';
  const next = NEXT.includes(state);
  const sides: Side[] = [
    ...row.loadingIds.map((id) => ({ kind: 'loading' as const, cargo: cargosById.get(id)! })),
    ...row.unloadingIds.map((id) => ({ kind: 'unloading' as const, cargo: cargosById.get(id)! })),
  ].filter((side) => side.cargo);
  const place: Place | null = stop.address
    ? { countryCode: stop.address.countryCode, postalCode: stop.address.postalCode, placeName: stop.address.placeName }
    : null;

  return (
    <RouteRow
      actions={
        <>
          {next && (
            <WithReason reason={row.blocked}>
              <Button disabled={!!row.blocked} loading={isPending} size="sm" onClick={() => void toggle()}>
                <Icon data-icon="inline-start" icon="IconCheck" size="s" /> {words.confirm}
              </Button>
            </WithReason>
          )}
          <VehicleStopMenu
            confirmLabel={words.confirm}
            isPending={isPending}
            row={row}
            shipmentId={shipmentId}
            onToggle={() => void toggle()}
          />
        </>
      }
      cardClassName={done ? 'border-transparent' : next ? NEXT_STOP_CARD : 'bg-card'}
      date={
        <DateCell
          date={stop.date}
          done={done}
          late={state === 'late'}
          missing={<span className="font-medium text-destructive">Datum nedostaje</span>}
        />
      }
      fromAbove={first ? undefined : done ? 'done' : 'idle'}
      last={!following}
      marker={<Marker className="bg-background" first={first} kind={kinds[0]} state={state} />}
      segment={following && <Segment kind={following.kinds[0]} to={following.state} />}
    >
      <span className="flex min-h-5 flex-wrap items-center gap-x-2.5 gap-y-1">
        <KindWords done={done} kinds={kinds} />
        {next && (
          <Badge look="solid" size="sm" tone="brand">
            Sljedeće
          </Badge>
        )}
        <OwnStatusText date={stop.date} daysLate={row.daysLate} state={state} />
      </span>
      <StopDetails
        cargoNumber={cargoNumber}
        done={done}
        extra={<DocsCount documents={stop.documents ?? []} />}
        place={place}
        sides={sides}
        street={stop.address?.streetName}
      />
      {!done && stop.driverId && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {stop.messageSentAt ? (
            <>
              <Icon className="size-3.5! [&_svg]:size-full!" icon="IconBellCheck" size="xs" /> Vozač obaviješten{' '}
              {formatDateTime(stop.messageSentAt, { short: true })}
            </>
          ) : (
            <>
              <Icon className="size-3.5! [&_svg]:size-full!" icon="IconBellOff" size="xs" /> Vozač još nije obaviješten
            </>
          )}
        </span>
      )}
      {done && stop.completedAt && (
        <span className={cn('flex items-center gap-1 text-xs', STATUS_TEXT.success)}>
          <Icon icon="IconCheck" size="xs" /> Potvrđeno · {formatDateTime(stop.completedAt, { short: true })}
        </span>
      )}
    </RouteRow>
  );
}

function VehicleRoute({ shipment }: { shipment: Shipment }) {
  const cargoIds = React.useMemo(() => shipment.cargo.map((cargo) => cargo.id), [shipment.cargo]);
  const rows = React.useMemo(
    () => buildVehicleRouteStops(shipment.vehicleStops ?? [], cargoIds),
    [shipment.vehicleStops, cargoIds]
  );
  const cargosById = React.useMemo(() => new Map(shipment.cargo.map((cargo) => [cargo.id, cargo])), [shipment.cargo]);
  const cargoNumber = React.useMemo(() => new Map(cargoIds.map((id, index) => [id, index + 1])), [cargoIds]);

  return (
    <section className="flex flex-col gap-3">
      <RouteHeading summary={countText(rows, 'gotovo')} title="Ruta" />
      <ol className="flex flex-col">
        {rows.map((row, index) => (
          <VehicleStopRow
            cargoNumber={cargoNumber}
            cargosById={cargosById}
            first={index === 0}
            following={rows[index + 1]}
            key={row.key}
            row={row}
            shipmentId={shipment.id}
          />
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Own nalog without a vehicle: the plan from the tereti (the quick look's stops)
// ---------------------------------------------------------------------------------------------------------------------

/** The tereti of a quick-look stop as sides, plus the street(s) of their address on that side. */
function planSides(kind: RouteStopKind, ids: string[], cargosById: Map<string, Cargo>) {
  const sides = ids
    .map((id) => cargosById.get(id))
    .filter((cargo): cargo is Cargo => !!cargo)
    .map((cargo) => ({ kind, cargo }));
  const streets = unique(
    sides.map(({ cargo }) => (kind === 'loading' ? cargo.loadingAddress : cargo.unloadingAddress)?.streetName)
  );
  return { sides, street: streets.join(', ') || undefined };
}

function PlanRoute({ shipment }: { shipment: Shipment }) {
  const stops = React.useMemo(
    () => buildRouteStops(shipment.cargo.map((cargo) => toTrackCargo(cargo, shipment.vehicleStops))),
    [shipment.cargo, shipment.vehicleStops]
  );
  const cargosById = React.useMemo(() => new Map(shipment.cargo.map((cargo) => [cargo.id, cargo])), [shipment.cargo]);
  const cargoNumber = React.useMemo(
    () => new Map(shipment.cargo.map((cargo, index) => [cargo.id, index + 1])),
    [shipment.cargo]
  );
  const rows = stops.map((stop) => ({ ...stop, kinds: [stop.kind] }));

  return (
    <section className="flex flex-col gap-3">
      <RouteHeading
        line="Planirano s naloga. Vozilo još nije dodijeljeno."
        summary={countText(rows, 'gotovo')}
        title="Ruta"
      />
      <ol className="flex flex-col">
        {rows.map((stop, index) => {
          const following = rows[index + 1];
          const done = stop.state === 'done';
          const { sides, street } = planSides(
            stop.kind,
            stop.cargos.map((cargo) => cargo.id),
            cargosById
          );
          return (
            <RouteRow
              cardClassName={done ? 'border-transparent' : 'bg-card'}
              date={
                <DateCell
                  date={stop.date}
                  done={done}
                  late={stop.state === 'late'}
                  missing={<span className="font-medium text-destructive">Datum nedostaje</span>}
                />
              }
              fromAbove={index === 0 ? undefined : done ? 'done' : 'idle'}
              key={stop.key}
              last={!following}
              marker={<Marker className="bg-background" first={index === 0} kind={stop.kind} state={stop.state} />}
              segment={following && <Segment kind={following.kind} to={following.state} />}
            >
              <span className="flex min-h-5 flex-wrap items-center gap-x-2.5 gap-y-1">
                <KindWords done={done} kinds={stop.kinds} />
                <OwnStatusText date={stop.date} daysLate={stop.daysLate} state={stop.state} />
              </span>
              <StopDetails cargoNumber={cargoNumber} done={done} place={stop.place} sides={sides} street={street} />
            </RouteRow>
          );
        })}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Agency nalog: Relacija, marked by hand
// ---------------------------------------------------------------------------------------------------------------------

function AgencyRoute({ shipment }: { shipment: Shipment }) {
  const { stops, cargoNumber, mark, isPending, busyKey } = useAgencyRoute(shipment);
  const cargosById = React.useMemo(() => new Map(shipment.cargo.map((cargo) => [cargo.id, cargo])), [shipment.cargo]);
  const rows = stops.map((stop) => ({ ...stop, kinds: [stop.kind], done: stop.state === 'marked' }));

  return (
    <section className="flex flex-col gap-3">
      <RouteHeading line="Planirano s naloga." summary={countText(rows, 'označeno')} title="Relacija" />
      <ol className="flex flex-col">
        {rows.map((stop, index) => {
          const following = rows[index + 1];
          const marked = stop.state === 'marked';
          const overdue = stop.state === 'overdue';
          const blocked = agencyUndoBlocked(stop);
          const { sides, street } = planSides(
            stop.kind,
            stop.cargos.map((cargo) => cargo.id),
            cargosById
          );
          return (
            <RouteRow
              actions={
                marked ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={isPending}
                      render={<Button aria-label="Više akcija" size="icon-sm" variant="ghost" />}
                    >
                      <Icon icon="IconDots" size="s" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuItem disabled={blocked} onClick={() => void mark(stop, true)}>
                        <Icon icon="IconArrowBackUp" size="s" /> {UNDO_LABEL[stop.kind]}
                      </DropdownMenuItem>
                      {blocked && (
                        <p className="px-2 pb-1.5 text-xs text-muted-foreground">
                          Teret je već označen istovarenim. Prvo vrati istovar.
                        </p>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    className={cn(overdue && OVERDUE_BUTTON)}
                    disabled={isPending}
                    loading={busyKey === stop.key}
                    size="sm"
                    variant="outline"
                    onClick={() => void mark(stop, false)}
                  >
                    <Icon data-icon="inline-start" icon="IconCheck" size="s" /> {MARK_LABEL[stop.kind]}
                  </Button>
                )
              }
              cardClassName={marked ? 'border-transparent' : overdue ? OVERDUE_STOP_CARD : 'bg-card'}
              date={
                <DateCell
                  date={stop.date}
                  done={marked}
                  missing={<span className="text-muted-foreground">Bez datuma</span>}
                />
              }
              fromAbove={index === 0 ? undefined : marked ? 'done' : 'idle'}
              key={stop.key}
              last={!following}
              marker={<AgencyMarker className="bg-background" state={stop.state} />}
              segment={
                // Green only up to a marked stop; nobody tracks a vehicle, so nothing in between.
                following && (
                  <span
                    className={cn(
                      'w-0.5 flex-1 rounded-full',
                      following.state === 'marked' ? STATUS_BAR.done : STATUS_BAR.idle
                    )}
                  />
                )
              }
            >
              <span className="flex min-h-5 flex-wrap items-center gap-x-2.5 gap-y-1">
                <KindWords done={marked} kinds={stop.kinds} />
                {overdue && <span className={cn('text-xs', STATUS_TEXT.warning)}>Rok prošao · označi status</span>}
              </span>
              <StopDetails cargoNumber={cargoNumber} done={marked} place={stop.place} sides={sides} street={street} />
              {/* The API keeps no who / when for a hand mark: say only that it was set by hand. */}
              {marked && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon icon="IconCheck" size="xs" /> Označeno ručno
                </span>
              )}
            </RouteRow>
          );
        })}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RouteSection({ shipment }: { shipment: Shipment }) {
  if (!shipment.cargo.length) return null;
  if (shipment.isAgency) return <AgencyRoute shipment={shipment} />;
  return shipment.vehicleStops?.length ? <VehicleRoute shipment={shipment} /> : <PlanRoute shipment={shipment} />;
}
