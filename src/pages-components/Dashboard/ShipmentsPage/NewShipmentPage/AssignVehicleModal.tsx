import dayjs from 'dayjs';
import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';

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
import type { Vehicle } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useAssignShipmentToVehicle, useEmployees, useVehicles, useVehicleStopsByVehicle } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import {
  Box,
  Button,
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
  onClose(): void;
  onAssigned(vehicleId: string): void;
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  isOpen,
  shipmentId,
  shipmentOrderNumber,
  onClose,
  onAssigned,
}) => {
  const { data: vehicleGroups, isLoading: isGroupsLoading } = useVehicleStopsByVehicle(5);
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles({ enabled: isOpen });
  const { data: employees } = useEmployees({ enabled: isOpen });
  const { mutateAsync: assignShipment, isPending } = useAssignShipmentToVehicle();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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
      const latestStop = g.stops[g.stops.length - 1];
      const driverName = latestStop?.driverId ? employeesById.get(latestStop.driverId)?.fullName : undefined;
      const placeNames = g.stops.map((s) => s.address?.placeName).filter((p): p is string => !!p);
      return [{ vehicle, stops: g.stops, latestStop, driverName, placeNames }];
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
    }
  }, [isOpen]);

  async function handleConfirm() {
    if (!selectedVehicleId) return;
    try {
      await assignShipment({ vehicleId: selectedVehicleId, shipmentId });
      showSuccessToast({ title: `Nalog "${shipmentOrderNumber}" dodijeljen vozilu` });
      onAssigned(selectedVehicleId);
    } catch {
      showErrorToast({ title: 'Greška pri dodjeli naloga vozilu' });
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent aria-describedby={undefined} className="max-w-[900px]">
        <DialogHeader className="flex-col">
          <FlexLayout className="items-center gap-1 text-dark-800 dark:text-light-50">
            <Icon icon="TruckIcon" size="l" />
            <DialogTitle>
              <Text variant="text-m-medium">Dodijeli vozilo</Text>
            </DialogTitle>
          </FlexLayout>
          <Text color="text-color-3" variant="text-xs">
            Odaberi vozilo na koje će se dodijeliti nalog &quot;{shipmentOrderNumber}&quot;.
          </Text>
        </DialogHeader>
        <Box className="px-1">
          <TextInput
            autoFocus
            iconLeft="MagnifyingGlassIcon"
            iconRight={search ? 'XMarkIcon' : undefined}
            isDisabled={isLoading}
            placeholder="Pretraži po registraciji, marki, vozaču ili mjestu..."
            value={search}
            onChange={setSearch}
            onClickIconRight={() => setSearch('')}
          />
        </Box>
        <Box className="h-[400px] overflow-y-auto">
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
                  stops={stops}
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
              isDisabled={!selectedVehicleId}
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

const CompactStopTimelineEntry = ({ stop, step }: { stop: VehicleStop; step: number }) => (
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
      <TimelineDate style={{ marginBottom: '12px' }}>
        {stop.date ? dayjs(stop.date).format('DD.MM.YYYY') : '-'}
      </TimelineDate>
      <TimelineIndicator className="z-10" style={{ top: '24px', left: 0, transform: 'translateY(-50%)' }} />
      <TimelineTitle>
        <Text as="span" color="text-color-1" variant="text-xxs">
          {stop.address?.placeName ?? '-'}
        </Text>
      </TimelineTitle>
    </TimelineHeader>
  </TimelineItem>
);

interface VehicleRowProps {
  vehicle: Vehicle;
  latestStop?: VehicleStop;
  stops: VehicleStop[];
  isSelected: boolean;
  onSelect(): void;
}

const VehicleRow = ({ vehicle, latestStop, stops, isSelected, onSelect }: VehicleRowProps) => {
  const recentStops = stops.slice(-3);

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
            <Icon color="text-color-1" icon="TruckIcon" size="m" />
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
              <Icon color="text-color-1" icon="UserIcon" size="m" />
              <EmployeeName color="text-color-1" id={latestStop.driverId} variant="text-s-medium" />
            </FlexLayout>
          </>
        )}
      </FlexLayout>
      {recentStops.length > 0 && (
        <Box className="flex-1 min-w-0">
          <Timeline className="w-full" defaultValue={recentStops.length} orientation="horizontal">
            {recentStops.map((stop, i) => (
              <CompactStopTimelineEntry key={stop.id} step={i + 1} stop={stop} />
            ))}
          </Timeline>
        </Box>
      )}
      {isSelected && (
        <FlexLayout className="flex-col absolute justify-center top-0 bottom-0 right-4">
          <Icon className="text-teal-500 shrink-0" icon="CheckIcon" size="m" />
        </FlexLayout>
      )}
    </FlexLayout>
  );
};
