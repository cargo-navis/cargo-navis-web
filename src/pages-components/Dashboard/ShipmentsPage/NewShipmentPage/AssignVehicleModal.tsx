import dayjs from 'dayjs';
import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';

import { ClientName } from '@/components/clients/ClientName';
import { EmployeeName } from '@/components/employees/EmployeeName';
import {
  Timeline,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import type { Cargo, Vehicle } from '@/lib/api';
import type { CreateVehicleStopParams, VehicleStop } from '@/lib/api/vehicleStops';
import { useCreateVehicleStops, useEmployees, useVehicles, useVehicleStopsByVehicle } from '@/lib/hooks';
import { getCargoLabel } from '@/lib/utils/cargo';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
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
} from '@/ui';

interface AssignVehicleModalProps {
  isOpen: boolean;
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

function buildPreviewStops(cargos: Cargo[]): PreviewStop[] {
  const map = new Map<string, PreviewStop>();
  for (const cargo of cargos) {
    if (cargo.loadingAddress) {
      const { id, streetName, placeName } = cargo.loadingAddress;
      const key = `${id}|${streetName}`;
      const existing = map.get(key);
      if (existing) existing.loadingCargoIds.push(cargo.id);
      else
        map.set(key, {
          key,
          postalCodeId: id,
          streetName,
          placeName,
          loadingCargoIds: [cargo.id],
          unloadingCargoIds: [],
        });
    }
    if (cargo.unloadingAddress) {
      const { id, streetName, placeName } = cargo.unloadingAddress;
      const key = `${id}|${streetName}`;
      const existing = map.get(key);
      if (existing) existing.unloadingCargoIds.push(cargo.id);
      else
        map.set(key, {
          key,
          postalCodeId: id,
          streetName,
          placeName,
          loadingCargoIds: [],
          unloadingCargoIds: [cargo.id],
        });
    }
  }
  return Array.from(map.values());
}

function buildCargoGroups(stop: PreviewStop, cargoById: Map<string, Cargo>): { loading: Cargo[]; unloading: Cargo[] } {
  const pickCargos = (ids: string[]) => ids.map((id) => cargoById.get(id)).filter((c): c is Cargo => !!c);
  return { loading: pickCargos(stop.loadingCargoIds), unloading: pickCargos(stop.unloadingCargoIds) };
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  isOpen,
  shipmentOrderNumber,
  clientId,
  cargos,
  onClose,
  onAssigned,
}) => {
  const { data: vehicleGroups, isLoading: isGroupsLoading } = useVehicleStopsByVehicle(5, { enabled: isOpen });
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles({ enabled: isOpen });
  const { data: employees } = useEmployees({ enabled: isOpen });
  const { mutateAsync: createStops, isPending } = useCreateVehicleStops();

  const previewStops = useMemo(() => buildPreviewStops(cargos), [cargos]);
  const cargoById = useMemo(() => new Map(cargos.map((c) => [c.id, c])), [cargos]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [datesByKey, setDatesByKey] = useState<Record<string, string | null>>({});

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

      const stops = g.stops;
      const latestStop = stops[stops.length - 1];
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
    const selectedRow = rows.find((r) => r.vehicle.id === selectedVehicleId);
    const driverId = selectedRow?.latestStop?.driverId ?? null;
    const disponentId = selectedRow?.latestStop?.disponentId ?? null;
    const trailerId = selectedRow?.latestStop?.trailerId ?? null;
    const payloads: CreateVehicleStopParams[] = previewStops.map((p) => ({
      vehicleId: selectedVehicleId,
      driverId,
      disponentId,
      trailerId,
      date: datesByKey[p.key],
      address: { streetName: p.streetName, postalCodeId: p.postalCodeId },
      loadingCargoIds: p.loadingCargoIds,
      unloadingCargoIds: p.unloadingCargoIds,
    }));

    try {
      await createStops(payloads);
      showSuccessToast({ title: `Nalog "${shipmentOrderNumber}" dodijeljen vozilu` });
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
              <>
                <PreviewStopCard
                  cargoGroups={buildCargoGroups(stop, cargoById)}
                  date={datesByKey[stop.key] ?? null}
                  key={stop.key}
                  stop={stop}
                  onDateChange={(date) => setDatesByKey((prev) => ({ ...prev, [stop.key]: date }))}
                />
                {i !== previewStops.length - 1 && <Divider />}
              </>
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
            <Button isDisabled={isPending} isFullWidth text="Odustani" variant="secondary" onClick={onClose} />
          </Box>
          <Box className="flex-1">
            <Button
              isDisabled={!isConfirmReady}
              isFullWidth
              isLoading={isPending}
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

interface CompactTimelineEntry {
  id: string;
  date: string | null;
  title: string | null;
  previewKind?: 'loading' | 'unloading' | 'both';
}

const previewStyleByKind = {
  loading: {
    indicator: 'border-orange-500 bg-orange-500/30',
    text: 'text-orange-500',
  },
  unloading: {
    indicator: 'border-teal-500 bg-teal-500/30',
    text: 'text-teal-500',
  },
  both: {
    indicator: 'border-purple-500 bg-purple-500/30',
    text: 'text-purple-500',
  },
} as const;

const CompactStopTimelineEntry = ({ entry, step }: { entry: CompactTimelineEntry; step: number }) => {
  const previewStyle = entry.previewKind ? previewStyleByKind[entry.previewKind] : null;

  return (
    <TimelineItem step={step} style={{ paddingRight: '24px' }}>
      <TimelineHeader>
        <TimelineSeparator
          style={{
            top: '24px',
            height: '2px',
            width: 'calc(100% - 16px)',
            transform: 'translateX(14px) translateY(-50%)',
          }}
        />
        <TimelineDate className={previewStyle?.text} style={{ marginBottom: '16px' }}>
          {entry.date ? dayjs(entry.date).format('DD.MM.YYYY') : '-'}
        </TimelineDate>
        <TimelineIndicator
          className={`z-10 ${previewStyle?.indicator ?? ''}`}
          style={{ top: '24px', left: 0, transform: 'translateY(-50%)' }}
        />
        <TimelineTitle>
          <Text
            as="span"
            color={previewStyle?.text ?? 'text-color-1'}
            variant={previewStyle ? 'text-xxs-medium' : 'text-xxs'}
          >
            {entry.title ?? '-'}
          </Text>
        </TimelineTitle>
      </TimelineHeader>
    </TimelineItem>
  );
};

interface VehicleRowProps {
  vehicle: Vehicle;
  latestStop?: VehicleStop;
  stops: VehicleStop[];
  previewStops: PreviewStop[];
  datesByKey: Record<string, string | null>;
  isSelected: boolean;
  onSelect(): void;
}

const VehicleRow = ({
  vehicle,
  latestStop,
  stops,
  previewStops,
  datesByKey,
  isSelected,
  onSelect,
}: VehicleRowProps) => {
  const matchedKeysByExistingStop = new Map<string, PreviewStop>();
  if (isSelected) {
    for (const p of previewStops) {
      const date = datesByKey[p.key];
      if (!date) continue;
      const existing = stops.find((s) => s.address?.id === p.postalCodeId && s.date === date);
      if (existing) matchedKeysByExistingStop.set(existing.id, p);
    }
  }

  const recentRealEntries: CompactTimelineEntry[] = stops.slice(-3).map((s) => {
    const matchedPreview = matchedKeysByExistingStop.get(s.id);
    const previewKind = matchedPreview ? getPreviewKind(matchedPreview) : undefined;
    const placeName = s.address?.placeName ?? null;
    const title = previewKind ? [`[${labelForKind(previewKind)}]`, placeName].filter(Boolean).join(' ') : placeName;
    return { id: s.id, date: s.date, title, previewKind };
  });

  const previewEntries: CompactTimelineEntry[] = [];
  if (isSelected) {
    const mergedKeys = new Set(Array.from(matchedKeysByExistingStop.values()).map((p) => p.key));
    for (const p of previewStops) {
      if (mergedKeys.has(p.key)) continue;
      const date = datesByKey[p.key];
      if (!date) continue;
      const kind = getPreviewKind(p);
      previewEntries.push({
        id: `preview-${p.key}`,
        date,
        title: [`[${labelForKind(kind)}]`, p.placeName].filter(Boolean).join(' '),
        previewKind: kind,
      });
    }
  }

  const recentEntries = [...recentRealEntries, ...previewEntries].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
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
      {recentEntries.length > 0 && (
        <Box className="flex-1 min-w-0">
          <Timeline className="w-full" defaultValue={recentEntries.length} orientation="horizontal">
            {recentEntries.map((entry, i) => (
              <CompactStopTimelineEntry entry={entry} key={entry.id} step={i + 1} />
            ))}
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

function getPreviewKind(p: PreviewStop): 'loading' | 'unloading' | 'both' {
  const hasLoading = p.loadingCargoIds.length > 0;
  const hasUnloading = p.unloadingCargoIds.length > 0;
  if (hasLoading && hasUnloading) return 'both';
  if (hasLoading) return 'loading';
  return 'unloading';
}

function labelForKind(kind: 'loading' | 'unloading' | 'both'): string {
  if (kind === 'loading') return 'Utovar';
  if (kind === 'unloading') return 'Istovar';
  return 'Utovar/Istovar';
}
