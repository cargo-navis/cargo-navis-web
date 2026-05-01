import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';

import { EmployeeName } from '@/components/employees/EmployeeName';
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
  const { data: vehicleGroups, isLoading: isGroupsLoading } = useVehicleStopsByVehicle(1);
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles({ enabled: isOpen });
  const { data: employees } = useEmployees({ enabled: isOpen });
  const { mutateAsync: assignShipment, isPending } = useAssignShipmentToVehicle();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const isLoading = isGroupsLoading || isVehiclesLoading;
  const rows = useMemo<{ vehicle: Vehicle; latestStop?: VehicleStop; driverName?: string }[]>(() => {
    if (!vehicleGroups || !vehicles) return [];
    const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));
    const employeesById = new Map((employees ?? []).map((e) => [e.id, e]));
    return vehicleGroups.flatMap((g) => {
      const vehicle = vehiclesById.get(g.vehicleId);
      if (!vehicle) return [];
      const latestStop = g.stops[0];
      const driverName = latestStop?.driverId ? employeesById.get(latestStop.driverId)?.fullName : undefined;
      return [{ vehicle, latestStop, driverName }];
    });
  }, [vehicleGroups, vehicles, employees]);

  const fuse = useMemo(
    () => new Fuse(rows, { keys: ['vehicle.registration', 'vehicle.brand', 'driverName'], threshold: 0.4 }),
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
            placeholder="Pretraži po registraciji, marki ili vozaču..."
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
              {filteredRows.map(({ vehicle, latestStop }) => (
                <VehicleRow
                  isSelected={vehicle.id === selectedVehicleId}
                  key={vehicle.id}
                  latestStop={latestStop}
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

interface VehicleRowProps {
  vehicle: Vehicle;
  latestStop?: VehicleStop;
  isSelected: boolean;
  onSelect(): void;
}

const VehicleRow = ({ vehicle, latestStop, isSelected, onSelect }: VehicleRowProps) => (
  <FlexLayout
    as="button"
    className={`items-center justify-between gap-3 rounded-m border p-3 text-left ${
      isSelected ? 'border-teal-500 bg-teal-500/10' : 'border-dark-100 hover:border-teal-500/70 dark:border-light-800'
    }`}
    type="button"
    onClick={onSelect}
  >
    <FlexLayout className="flex-col">
      <Text color="text-color-1" variant="text-s-medium">
        {vehicle.registration}
      </Text>
      <Text color="text-color-3" variant="text-xxs">
        {vehicle.brand}
      </Text>
      {latestStop?.driverId && (
        <FlexLayout className="items-center gap-1">
          <Icon color="text-color-3" icon="UserIcon" size="s" />
          <EmployeeName color="text-color-3" id={latestStop.driverId} variant="text-xxs" />
        </FlexLayout>
      )}
    </FlexLayout>
    {isSelected && <Icon className="text-teal-500" icon="CheckIcon" size="m" />}
  </FlexLayout>
);
