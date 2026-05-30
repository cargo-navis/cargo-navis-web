import clsx from 'clsx';
import dayjs from 'dayjs';
import Fuse from 'fuse.js';
import { Fragment, useEffect, useMemo, useState } from 'react';

import { ClientName } from '@/components/clients/ClientName';
import { EmployeeName } from '@/components/employees/EmployeeName';
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import type { Cargo, LoadingAddress, Vehicle } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useAssignShipmentToVehicle, useEmployees, useVehicles, useVehicleStopsByVehicle } from '@/lib/hooks';
import { getCargoLabel, getCargoLabelParts } from '@/lib/utils/cargo';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import {
  Box,
  Button,
  Datepicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Divider,
  FlexLayout,
  Icon,
  Skeleton,
  Text,
  TextInput,
  Tooltip,
} from '@/ui';

import { RemainingStopsBadge, StopTimelineEntry } from '../../VehicleStopsPage/StopItem';

interface AssignVehicleModalProps {
  isOpen: boolean;
  shipmentId: string;
  shipmentOrderNumber: string;
  clientId?: string | null;
  cargos: Cargo[];
  onClose(): void;
  onAssigned(vehicleId: string): void;
}

interface PreviewStop {
  key: string;
  postalCodeId: string;
  streetName: string;
  placeName: string;
  loadingCargoIds: string[];
  unloadingCargoIds: string[];
}

function stopKey(address: Pick<LoadingAddress, 'postalCodeId' | 'streetName'>) {
  return `${address.postalCodeId}|${address.streetName}`;
}

function buildPreviewStops(cargos: Cargo[]): PreviewStop[] {
  const map = new Map<string, PreviewStop>();

  function add(address: LoadingAddress | undefined, cargoId: string, kind: 'loading' | 'unloading') {
    if (!address) return;
    const { postalCodeId, streetName, placeName } = address;
    const key = stopKey(address);
    const stop = map.get(key) ?? {
      key,
      postalCodeId,
      streetName,
      placeName,
      loadingCargoIds: [],
      unloadingCargoIds: [],
    };
    stop[kind === 'loading' ? 'loadingCargoIds' : 'unloadingCargoIds'].push(cargoId);
    map.set(key, stop);
  }

  for (const cargo of cargos) {
    add(cargo.loadingAddress, cargo.id, 'loading');
    add(cargo.unloadingAddress, cargo.id, 'unloading');
  }
  // Loading stops first, unloading-only stops second.
  return Array.from(map.values()).sort((a, b) => {
    const aLoading = a.loadingCargoIds.length > 0 ? 0 : 1;
    const bLoading = b.loadingCargoIds.length > 0 ? 0 : 1;
    return aLoading - bLoading;
  });
}

function buildCargoStopDates(cargos: Cargo[], datesByKey: Record<string, string | null>) {
  return cargos.map((cargo) => ({
    cargoId: cargo.id,
    loadingDate: cargo.loadingAddress ? (datesByKey[stopKey(cargo.loadingAddress)] ?? null) : null,
    unloadingDate: cargo.unloadingAddress ? (datesByKey[stopKey(cargo.unloadingAddress)] ?? null) : null,
  }));
}

function buildCargoGroups(stop: PreviewStop, cargoById: Map<string, Cargo>): { loading: Cargo[]; unloading: Cargo[] } {
  const pickCargos = (ids: string[]) => ids.map((id) => cargoById.get(id)).filter((c): c is Cargo => !!c);
  return { loading: pickCargos(stop.loadingCargoIds), unloading: pickCargos(stop.unloadingCargoIds) };
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  isOpen,
  shipmentId,
  shipmentOrderNumber,
  clientId,
  cargos,
  onClose,
  onAssigned,
}) => {
  const { data: vehicleGroups, isLoading: isGroupsLoading } = useVehicleStopsByVehicle(5, { enabled: isOpen });
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles({ enabled: isOpen });
  const { data: employees } = useEmployees({ enabled: isOpen });
  const { mutateAsync: assignShipment, isPending } = useAssignShipmentToVehicle();

  const previewStops = useMemo(() => buildPreviewStops(cargos), [cargos]);
  const cargoById = useMemo(() => new Map(cargos.map((c) => [c.id, c])), [cargos]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [datesByKey, setDatesByKey] = useState<Record<string, string | null>>({});
  const [isNavigating, setIsNavigating] = useState(false);

  const isBusy = isPending || isNavigating;

  const isLoading = isGroupsLoading || isVehiclesLoading;

  const rows = useMemo<
    {
      vehicle: Vehicle;
      stops: VehicleStop[];
      latestStop?: VehicleStop;
      driverName?: string;
      placeNames: string[];
    }[]
  >(() => {
    if (!vehicleGroups || !vehicles) return [];
    const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));
    const employeesById = new Map((employees ?? []).map((e) => [e.id, e]));
    return vehicleGroups.flatMap((g) => {
      const vehicle = vehiclesById.get(g.vehicleId);
      if (!vehicle) return [];

      // API returns stops newest-first, so the latest stop sits at index 0.
      const stops = g.stops;
      const latestStop = stops[0];
      const driverName = latestStop?.driverId ? employeesById.get(latestStop.driverId)?.fullName : undefined;
      const placeNames = stops.map((s) => s.address?.placeName).filter((p): p is string => !!p);
      return [{ vehicle, stops, latestStop, driverName, placeNames }];
    });
  }, [vehicleGroups, vehicles, employees]);

  const fuse = useMemo(
    () =>
      new Fuse(rows, {
        keys: ['vehicle.registration', 'vehicle.brand', 'driverName', 'placeNames'],
        threshold: 0.4,
      }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return fuse.search(search).map((r) => r.item);
  }, [rows, fuse, search]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedVehicleId(null);
      setSearch('');
      setDatesByKey({});
    }
  }, [isOpen]);

  const allDatesPicked = previewStops.every((p) => !!datesByKey[p.key]);
  const isConfirmReady = !!selectedVehicleId && previewStops.length > 0 && allDatesPicked;

  async function handleConfirm() {
    if (!selectedVehicleId || !allDatesPicked) return;

    try {
      await assignShipment({
        shipmentId,
        vehicleId: selectedVehicleId,
        cargoStopDates: buildCargoStopDates(cargos, datesByKey),
      });
      showSuccessToast({ title: `Nalog "${shipmentOrderNumber}" dodijeljen vozilu` });
      setIsNavigating(true);
      onAssigned(selectedVehicleId);
    } catch {
      showErrorToast({ title: 'Greška pri dodjeli naloga vozilu' });
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[1040px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-col">
          <FlexLayout className="items-center gap-1 text-dark-800 dark:text-light-50">
            <Icon icon="IconTruck" size="l" />
            <DialogTitle>
              <Text variant="text-m-medium">Dodijeli vozilo</Text>
            </DialogTitle>
          </FlexLayout>
          <Text as="span" color="text-color-3" variant="text-xs">
            Odaberi vozilo na koje će se dodijeliti nalog &quot;{shipmentOrderNumber}&quot;
            {clientId && (
              <>
                {' '}
                za <ClientName as="span" color="text-color-3" id={clientId} variant="text-xs" />
              </>
            )}
          </Text>
        </DialogHeader>

        <FlexLayout className="flex-col gap-3 pt-2">
          <Text color="text-color-3" variant="text-xs">
            Stanice koje će biti dodijeljene vozilu:
          </Text>
          <FlexLayout className="flex-col gap-2">
            {previewStops.map((stop, i) => (
              <Fragment key={stop.key}>
                <PreviewStopCard
                  cargoGroups={buildCargoGroups(stop, cargoById)}
                  date={datesByKey[stop.key] ?? null}
                  stop={stop}
                  onDateChange={(date) => setDatesByKey((prev) => ({ ...prev, [stop.key]: date }))}
                />
                {i !== previewStops.length - 1 && <Divider />}
              </Fragment>
            ))}
          </FlexLayout>
        </FlexLayout>

        <Box className="my-2">
          <Divider />
        </Box>

        <FlexLayout className="flex-col gap-3">
          <Box className="px-1">
            <Text color="text-color-3" variant="text-xxs-medium">
              Odaberi vozilo *
            </Text>
          </Box>
          <Box className="px-1">
            <TextInput
              iconLeft="IconSearch"
              iconRight={search ? 'IconX' : undefined}
              isDisabled={isLoading}
              placeholder="Pretraži po registraciji, marki, vozaču ili mjestu..."
              value={search}
              onChange={setSearch}
              onClickIconRight={() => setSearch('')}
            />
          </Box>
          <Box className="h-[420px] overflow-y-auto">
            {isLoading ? (
              <FlexLayout className="flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton borderRadius="m" height={48} key={i} width="100%" />
                ))}
              </FlexLayout>
            ) : rows.length === 0 ? (
              <Text color="text-color-3" variant="text-s">
                Nema dostupnih vozila.
              </Text>
            ) : filteredRows.length === 0 ? (
              <Text color="text-color-3" variant="text-s">
                Nema rezultata.
              </Text>
            ) : (
              <FlexLayout className="flex-col gap-2">
                {filteredRows.map(({ vehicle, latestStop, stops }) => (
                  <VehicleRow
                    cargoById={cargoById}
                    datesByKey={datesByKey}
                    isSelected={vehicle.id === selectedVehicleId}
                    key={vehicle.id}
                    latestStop={latestStop}
                    previewStops={previewStops}
                    stops={stops}
                    vehicle={vehicle}
                    onSelect={() => setSelectedVehicleId(vehicle.id)}
                  />
                ))}
              </FlexLayout>
            )}
          </Box>
        </FlexLayout>
        <FlexLayout className="justify-end gap-3 pt-2">
          <Box className="flex-1">
            <Button isDisabled={isBusy} isFullWidth text="Odustani" variant="secondary" onClick={onClose} />
          </Box>
          <Box className="flex-1">
            <Button
              isDisabled={!isConfirmReady || isBusy}
              isFullWidth
              isLoading={isBusy}
              text="Potvrdi"
              onClick={handleConfirm}
            />
          </Box>
        </FlexLayout>
      </DialogContent>
    </Dialog>
  );
};

interface PreviewStopCardProps {
  stop: PreviewStop;
  date: string | null;
  cargoGroups: { loading: Cargo[]; unloading: Cargo[] };
  onDateChange(date: string | null): void;
}

const PreviewStopCard = ({ stop, date, cargoGroups, onDateChange }: PreviewStopCardProps) => {
  const hasLoading = cargoGroups.loading.length > 0;
  const hasUnloading = cargoGroups.unloading.length > 0;

  return (
    <FlexLayout className="items-center gap-3 p-3">
      <FlexLayout className="flex-col gap-2 flex-1 min-w-0">
        <FlexLayout className="items-center gap-2">
          {hasLoading && <Icon className="text-orange-500 dark:text-orange-400" icon="IconPackageImport" size="s" />}
          {hasUnloading && <Icon className="text-teal-500 dark:text-teal-400" icon="IconPackageExport" size="s" />}
          <Text className="overflow-hidden text-ellipsis" color="text-color-1" variant="text-s-medium">
            {stop.placeName}
          </Text>
          <Text className="overflow-hidden text-ellipsis" color="text-color-3" variant="text-xs">
            {stop.streetName}
          </Text>
        </FlexLayout>
        <FlexLayout className="gap-4 flex-wrap">
          {hasLoading && <CargoList cargos={cargoGroups.loading} color="text-orange-500" label="Utovar" />}
          {hasUnloading && <CargoList cargos={cargoGroups.unloading} color="text-teal-500" label="Istovar" />}
        </FlexLayout>
      </FlexLayout>
      <Box className="w-[200px] shrink-0">
        <Datepicker isClearable={false} placeholder="Odaberi datum" value={date} onChange={onDateChange} />
      </Box>
    </FlexLayout>
  );
};

const CargoList = ({ label, color, cargos }: { label: string; color: string; cargos: Cargo[] }) => (
  <FlexLayout className="flex-col gap-1">
    <Text as="span" color={color} variant="text-xxs-medium">
      {label}
    </Text>
    <FlexLayout as="ul" className="flex-col gap-0.5 list-disc list-inside">
      {cargos.map((cargo) => (
        <Text as="li" color="text-color-2" key={cargo.id} variant="text-xxs">
          {getCargoLabel(cargo)}
        </Text>
      ))}
    </FlexLayout>
  </FlexLayout>
);

const TIMELINE_SIZE = 5;

const previewStyleByKind = {
  loading: {
    indicator: 'border-orange-500 bg-orange-500/30',
    text: 'text-orange-500',
    iconColor: 'text-orange-400',
  },
  unloading: {
    indicator: 'border-teal-500 bg-teal-500/30',
    text: 'text-teal-500',
    iconColor: 'text-teal-400',
  },
  both: {
    indicator: 'border-purple-500 bg-purple-500/30',
    text: 'text-purple-500',
    iconColor: 'text-purple-400',
  },
} as const;

function getPreviewKind(p: PreviewStop): 'loading' | 'unloading' | 'both' {
  const hasLoading = p.loadingCargoIds.length > 0;
  const hasUnloading = p.unloadingCargoIds.length > 0;
  if (hasLoading && hasUnloading) return 'both';
  if (hasLoading) return 'loading';
  return 'unloading';
}

type TimelineRow =
  | { kind: 'real'; stop: VehicleStop }
  | { kind: 'preview'; preview: PreviewStop; date: string }
  | { kind: 'gap'; stops: VehicleStop[] };

function buildVehicleTimelineLayout({
  realStops,
  previewStops,
  datesByKey,
}: {
  realStops: VehicleStop[];
  previewStops: PreviewStop[];
  datesByKey: Record<string, string | null>;
}): TimelineRow[] {
  const datedPreviews = previewStops
    .map((p) => ({ p, date: datesByKey[p.key] || null }))
    .filter((x): x is { p: PreviewStop; date: string } => !!x.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  // realStops arrives newest-first from the API. Reverse to oldest-first so
  // that a stable sort by date keeps the newest at the END of sortedReal;
  // slice(-budget) then picks the newest stops, including the correct
  // tiebreaker when several stops share the same date.
  const sortedReal = realStops.toReversed().sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  // Previews are mandatory; budget the rest of the timeline slots for real stops.
  const budget = Math.max(0, TIMELINE_SIZE - datedPreviews.length);
  const visibleReal = new Set(sortedReal.slice(-budget));

  type Merged =
    | { kind: 'real'; stop: VehicleStop; date: string | null }
    | { kind: 'preview'; preview: PreviewStop; date: string };

  const merged: Merged[] = [
    ...sortedReal.map<Merged>((s) => ({ kind: 'real', stop: s, date: s.date ?? null })),
    ...datedPreviews.map<Merged>(({ p, date }) => ({ kind: 'preview', preview: p, date })),
  ].sort((a, b) => (a.date ?? '￿').localeCompare(b.date ?? '￿'));

  // Walk the merged list, collapsing runs of hidden real stops into gap entries.
  const rows: TimelineRow[] = [];
  let pendingGap: VehicleStop[] = [];
  const flushGap = () => {
    if (pendingGap.length > 0) {
      rows.push({ kind: 'gap', stops: pendingGap });
      pendingGap = [];
    }
  };

  for (const item of merged) {
    if (item.kind === 'real') {
      if (visibleReal.has(item.stop)) {
        flushGap();
        rows.push({ kind: 'real', stop: item.stop });
      } else if (rows.length > 0) {
        // Only buffer a gap once we've emitted something; leading hidden stops
        // are dropped silently (matches VehicleStopCard's behavior of biasing
        // toward recent activity without a leading "+X").
        pendingGap.push(item.stop);
      }
    } else {
      flushGap();
      rows.push({ kind: 'preview', preview: item.preview, date: item.date });
    }
  }
  flushGap();

  return rows;
}

const PreviewTooltipContent: React.FC<{
  preview: PreviewStop;
  date: string;
  cargoGroups: { loading: Cargo[]; unloading: Cargo[] };
}> = ({ preview, date, cargoGroups }) => {
  const { loading, unloading } = cargoGroups;
  return (
    <FlexLayout className="p-2 flex-col gap-1 text-light-50">
      <Text variant="text-xxs-medium">{preview.streetName}</Text>
      <Text variant="text-s">{preview.placeName}</Text>
      <Text color="text-color-4" variant="text-xxs">
        {dayjs(date).format('DD.MM.YYYY')}
      </Text>
      <Text className="italic" color="text-light-300" variant="text-xxs">
        Bit će dodano
      </Text>
      {(loading.length > 0 || unloading.length > 0) && (
        <FlexLayout className="items-center gap-1 mt-1">
          {loading.length > 0 && (
            <Text as="span" className="text-orange-400" variant="text-xs">
              {loading.length} utovar
            </Text>
          )}
          {loading.length > 0 && unloading.length > 0 && (
            <Text as="span" className="text-light-50" variant="text-xs">
              ,
            </Text>
          )}
          {unloading.length > 0 && (
            <Text as="span" className="text-teal-400" variant="text-xs">
              {unloading.length} istovar
            </Text>
          )}
        </FlexLayout>
      )}
      {[
        ...loading.map((c) => ({ c, kind: 'loading' as const })),
        ...unloading.map((c) => ({ c, kind: 'unloading' as const })),
      ].map(({ c, kind }) => {
        const { primary, secondary } = getCargoLabelParts(c);
        const color = kind === 'loading' ? 'text-orange-400' : 'text-teal-400';
        const icon = kind === 'loading' ? 'IconPackageImport' : 'IconPackageExport';
        return (
          <FlexLayout className="items-center gap-1 pl-1" key={`${c.id}-${kind}`}>
            <Icon className={color} icon={icon} size="s" />
            <Text className={color} variant="text-xxs-medium">
              {primary}
            </Text>
            {secondary && (
              <Text color="text-light-300" variant="text-xxs">
                ({secondary})
              </Text>
            )}
          </FlexLayout>
        );
      })}
    </FlexLayout>
  );
};

const PreviewStopTimelineEntry: React.FC<{
  preview: PreviewStop;
  date: string;
  cargoGroups: { loading: Cargo[]; unloading: Cargo[] };
  step: number;
  isNextCompleted: boolean;
}> = ({ preview, date, cargoGroups, step, isNextCompleted }) => {
  const hasLoading = cargoGroups.loading.length > 0;
  const hasUnloading = cargoGroups.unloading.length > 0;
  const kind = getPreviewKind(preview);
  const style = previewStyleByKind[kind];

  return (
    <TimelineItem separatorActive={isNextCompleted} step={step} style={{ paddingRight: '32px', isolation: 'isolate' }}>
      <TimelineHeader>
        <TimelineSeparator
          className={isNextCompleted ? undefined : 'bg-transparent'}
          style={{
            top: '28px',
            height: '2px',
            width: 'calc(100% - 20px)',
            transform: 'translateX(18px) translateY(-50%)',
            ...(isNextCompleted
              ? {}
              : {
                  backgroundImage:
                    'repeating-linear-gradient(to right, rgb(19 148 159 / 0.3) 0 5px, transparent 5px 9px)',
                }),
          }}
        />
        <TimelineDate className={style.text} style={{ marginBottom: '20px' }}>
          {dayjs(date).format('DD.MM.YYYY')}
        </TimelineDate>
        <TimelineTitle>
          <Text as="span" className="inline-flex items-center gap-1" color={style.text} variant="text-s-medium">
            {preview.placeName || '-'}
            {hasLoading && <Icon className="text-orange-500 dark:text-orange-400" icon="IconPackageImport" size="s" />}
            {hasUnloading && <Icon className="text-teal-500 dark:text-teal-400" icon="IconPackageExport" size="s" />}
          </Text>
        </TimelineTitle>
        <Tooltip content={<PreviewTooltipContent cargoGroups={cargoGroups} date={date} preview={preview} />} isPortal>
          <TimelineIndicator
            className={clsx('z-10 cursor-default', style.indicator)}
            style={{ top: '28px', left: 0, transform: 'translateY(-50%)' }}
            onClick={(e) => e.preventDefault()}
          />
        </Tooltip>
      </TimelineHeader>
      <TimelineContent>
        <Text color="text-color-3" variant="text-xxxs">
          {preview.streetName}
        </Text>
      </TimelineContent>
    </TimelineItem>
  );
};

const GapTooltipContent: React.FC<{ stops: VehicleStop[] }> = ({ stops }) => {
  // List hidden stops newest-first, matching the API's natural order.
  const ordered = [...stops].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
  return (
    <FlexLayout className="p-2 flex-col gap-2 text-light-50">
      <Text variant="text-xxs-medium">Skrivene stanice</Text>
      {ordered.map((s) => (
        <FlexLayout className="items-baseline gap-2" key={s.id}>
          <Text color="text-color-4" variant="text-xxs">
            {s.date ? dayjs(s.date).format('DD.MM.YYYY') : '—'}
          </Text>
          <Text variant="text-xs">{s.address?.placeName ?? '-'}</Text>
          {s.address?.streetName && (
            <Text color="text-light-300" variant="text-xxs">
              {s.address.streetName}
            </Text>
          )}
        </FlexLayout>
      ))}
    </FlexLayout>
  );
};

interface VehicleRowProps {
  vehicle: Vehicle;
  latestStop?: VehicleStop;
  stops: VehicleStop[];
  previewStops: PreviewStop[];
  cargoById: Map<string, Cargo>;
  datesByKey: Record<string, string | null>;
  isSelected: boolean;
  onSelect(): void;
}

const VehicleRow = ({
  vehicle,
  latestStop,
  stops,
  previewStops,
  cargoById,
  datesByKey,
  isSelected,
  onSelect,
}: VehicleRowProps) => {
  const rows = buildVehicleTimelineLayout({
    realStops: stops,
    previewStops: isSelected ? previewStops : [],
    datesByKey,
  });

  return (
    <FlexLayout
      as="button"
      className={`flex-col gap-3 relative rounded-m border p-3 text-left ${
        isSelected ? 'border-teal-500 bg-teal-500/10' : 'border-dark-100 hover:border-teal-500/70 dark:border-light-800'
      }`}
      type="button"
      onClick={onSelect}
    >
      <FlexLayout className="gap-3 items-start">
        <FlexLayout className="flex-col">
          <FlexLayout className="items-center gap-1">
            <Icon color="text-color-1" icon="IconTruck" size="m" />
            <Text color="text-color-1" variant="text-s-medium">
              {vehicle.registration}
            </Text>
          </FlexLayout>
          <Text color="text-color-3" variant="text-xxs">
            {vehicle.brand}
          </Text>
        </FlexLayout>
        {latestStop?.driverId && (
          <>
            •
            <FlexLayout className="items-center gap-1">
              <Icon color="text-color-1" icon="IconSteeringWheel" size="m" />
              <EmployeeName color="text-color-1" id={latestStop.driverId} variant="text-s-medium" />
            </FlexLayout>
          </>
        )}
      </FlexLayout>
      {rows.length > 0 && (
        <Box className="flex-1 min-w-0">
          <Timeline className="w-full" defaultValue={rows.length} orientation="horizontal">
            {rows.map((row, i) => {
              const next = rows[i + 1];
              const step = i + 1;
              if (row.kind === 'real') {
                const nextStop = next?.kind === 'real' ? next.stop : undefined;
                const connectsToMore = !!next && next.kind !== 'real';
                return (
                  <StopTimelineEntry
                    connectsToMore={connectsToMore}
                    key={row.stop.id}
                    nextStop={nextStop}
                    step={step}
                    stop={row.stop}
                  />
                );
              }
              if (row.kind === 'preview') {
                const cargoGroups = buildCargoGroups(row.preview, cargoById);
                const isNextCompleted = next?.kind === 'real' ? isStopCompleted(next.stop) : false;
                return (
                  <PreviewStopTimelineEntry
                    cargoGroups={cargoGroups}
                    date={row.date}
                    isNextCompleted={isNextCompleted}
                    key={`preview-${row.preview.key}`}
                    preview={row.preview}
                    step={step}
                  />
                );
              }
              return (
                <RemainingStopsBadge
                  count={row.stops.length}
                  key={`gap-${i}`}
                  step={step}
                  tooltipContent={<GapTooltipContent stops={row.stops} />}
                />
              );
            })}
          </Timeline>
        </Box>
      )}
      {isSelected && (
        <FlexLayout className="flex-col absolute justify-center top-0 bottom-0 right-4">
          <Icon className="text-teal-500 shrink-0" icon="IconCheck" size="m" />
        </FlexLayout>
      )}
    </FlexLayout>
  );
};
