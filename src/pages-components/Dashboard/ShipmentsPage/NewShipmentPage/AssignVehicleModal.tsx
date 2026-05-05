import dayjs from 'dayjs';
import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';

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
import type { Vehicle } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useAssignShipmentToVehicle, useEmployees, useVehicles, useVehicleStopsByVehicle } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import {
  Box,
  Button,
  Datepicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FlexLayout,
  Icon,
  Skeleton,
  Text,
  TextInput,
} from '@/ui';

interface AssignVehicleModalProps {
  isOpen: boolean;
  shipmentId: string;
  shipmentOrderNumber: string;
  cargoIds: string[];
  loadingPlaceName?: string;
  unloadingPlaceName?: string;
  loadingAddressId?: string;
  unloadingAddressId?: string;
  onClose(): void;
  onAssigned(vehicleId: string): void;
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  isOpen,
  shipmentId,
  shipmentOrderNumber,
  cargoIds,
  loadingPlaceName,
  unloadingPlaceName,
  loadingAddressId,
  unloadingAddressId,
  onClose,
  onAssigned,
}) => {
  const { data: vehicleGroups, isLoading: isGroupsLoading } = useVehicleStopsByVehicle(5, { enabled: isOpen });
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles({ enabled: isOpen });
  const { data: employees } = useEmployees({ enabled: isOpen });
  const { mutateAsync: assignShipment, isPending } = useAssignShipmentToVehicle();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const [unloadingDate, setUnloadingDate] = useState<string | null>(null);

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
      setLoadingDate(null);
      setUnloadingDate(null);
    }
  }, [isOpen]);

  const isConfirmReady = !!selectedVehicleId && !!loadingDate && !!unloadingDate;

  async function handleConfirm() {
    if (!selectedVehicleId || !loadingDate || !unloadingDate) return;
    try {
      await assignShipment({
        vehicleId: selectedVehicleId,
        shipmentId,
        cargoStopDates: cargoIds.map((cargoId) => ({ cargoId, loadingDate, unloadingDate })),
      });
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
          <Text color="text-color-3" variant="text-xs">
            Odaberi vozilo na koje će se dodijeliti nalog &quot;{shipmentOrderNumber}&quot;.
          </Text>
        </DialogHeader>
        <FlexLayout className="gap-3 px-1">
          <Box className="flex-1">
            <Text className="mb-1 block" color="text-color-3" variant="text-xxs-medium">
              Datum utovara *
            </Text>
            <Datepicker
              isClearable={false}
              maxDate={unloadingDate ?? undefined}
              placeholder="Odaberi datum utovara"
              value={loadingDate}
              onChange={setLoadingDate}
            />
          </Box>
          <Box className="flex-1">
            <Text className="mb-1 block" color="text-color-3" variant="text-xxs-medium">
              Datum istovara *
            </Text>
            <Datepicker
              isClearable={false}
              minDate={loadingDate ?? undefined}
              placeholder="Odaberi datum istovara"
              value={unloadingDate}
              onChange={setUnloadingDate}
            />
          </Box>
        </FlexLayout>
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
        <Box className="h-[540px] overflow-y-auto">
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
                  isSelected={vehicle.id === selectedVehicleId}
                  key={vehicle.id}
                  latestStop={latestStop}
                  loadingAddressId={loadingAddressId}
                  loadingDate={loadingDate}
                  loadingPlaceName={loadingPlaceName}
                  stops={stops}
                  unloadingAddressId={unloadingAddressId}
                  unloadingDate={unloadingDate}
                  unloadingPlaceName={unloadingPlaceName}
                  vehicle={vehicle}
                  onSelect={() => setSelectedVehicleId(vehicle.id)}
                />
              ))}
            </FlexLayout>
          )}
        </Box>
        <FlexLayout className="justify-end gap-3">
          <Box className="flex-1">
            <Button isDisabled={isPending} isFullWidth text="Kasnije" variant="secondary" onClick={onClose} />
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

interface CompactTimelineEntry {
  id: string;
  date: string | null;
  title: string | null;
  subtitle?: string | null;
  previewKind?: 'loading' | 'unloading';
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
        {entry.subtitle && (
          <TimelineContent>
            <Text color="text-color-3" variant="text-xxxs">
              {entry.subtitle}
            </Text>
          </TimelineContent>
        )}
      </TimelineHeader>
    </TimelineItem>
  );
};

interface VehicleRowProps {
  vehicle: Vehicle;
  latestStop?: VehicleStop;
  stops: VehicleStop[];
  loadingDate: string | null;
  unloadingDate: string | null;
  loadingPlaceName?: string;
  unloadingPlaceName?: string;
  loadingAddressId?: string;
  unloadingAddressId?: string;
  isSelected: boolean;
  onSelect(): void;
}

const VehicleRow = ({
  vehicle,
  latestStop,
  stops,
  loadingDate,
  unloadingDate,
  loadingPlaceName,
  unloadingPlaceName,
  loadingAddressId,
  unloadingAddressId,
  isSelected,
  onSelect,
}: VehicleRowProps) => {
  const recentRealEntries: CompactTimelineEntry[] = stops.slice(-3).map((s) => {
    const matchesLoading = isSelected && !!loadingDate && s.date === loadingDate && s.address?.id === loadingAddressId;
    const matchesUnloading =
      isSelected && !!unloadingDate && s.date === unloadingDate && s.address?.id === unloadingAddressId;
    const previewKind = matchesLoading ? 'loading' : matchesUnloading ? 'unloading' : undefined;
    const placeName = s.address?.placeName ?? null;
    const title = previewKind
      ? [`[${previewKind === 'loading' ? 'Utovar' : 'Istovar'}]`, placeName].filter(Boolean).join(' ')
      : placeName;
    return { id: s.id, date: s.date, title, previewKind };
  });

  const previewEntries: CompactTimelineEntry[] = [];
  if (isSelected) {
    const loadingMerged = recentRealEntries.some((e) => e.previewKind === 'loading');
    const unloadingMerged = recentRealEntries.some((e) => e.previewKind === 'unloading');
    if (loadingDate && !loadingMerged) {
      previewEntries.push({
        id: 'preview-loading',
        date: loadingDate,
        title: ['[Utovar]', loadingPlaceName].filter(Boolean).join(' '),
        previewKind: 'loading',
      });
    }
    if (unloadingDate && !unloadingMerged) {
      previewEntries.push({
        id: 'preview-unloading',
        date: unloadingDate,
        title: ['[Istovar]', unloadingPlaceName].filter(Boolean).join(' '),
        previewKind: 'unloading',
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
