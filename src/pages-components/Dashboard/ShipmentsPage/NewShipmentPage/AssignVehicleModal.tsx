import { useEffect, useMemo, useState } from 'react';

import { EmployeeName } from '@/components/employees/EmployeeName';
import type { Vehicle } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useAssignShipmentToVehicle, useVehicles, useVehicleStopsByVehicle } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon, Skeleton, Text } from '@/ui';

interface AssignVehicleModalProps {
  isOpen: boolean;
  shipmentId: string;
  shipmentOrderNumber: string;
  onClose(): void;
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  isOpen,
  shipmentId,
  shipmentOrderNumber,
  onClose,
}) => {
  const { data: vehicleGroups, isLoading: isGroupsLoading } = useVehicleStopsByVehicle(1);
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles({ enabled: isOpen });
  const { mutateAsync: assignShipment, isPending } = useAssignShipmentToVehicle();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const isLoading = isGroupsLoading || isVehiclesLoading;
  const rows = useMemo<{ vehicle: Vehicle; latestStop?: VehicleStop }[]>(() => {
    if (!vehicleGroups || !vehicles) return [];
    const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));
    return vehicleGroups.flatMap((g) => {
      const vehicle = vehiclesById.get(g.vehicleId);
      return vehicle ? [{ vehicle, latestStop: g.stops[0] }] : [];
    });
  }, [vehicleGroups, vehicles]);

  useEffect(() => {
    if (!isOpen) setSelectedVehicleId(null);
  }, [isOpen]);

  async function handleConfirm() {
    if (!selectedVehicleId) return;
    try {
      await assignShipment({ vehicleId: selectedVehicleId, shipmentId });
      showSuccessToast({ title: `Nalog "${shipmentOrderNumber}" dodijeljen vozilu` });
      onClose();
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
        <Box className="max-h-[400px] overflow-y-auto">
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
          ) : (
            <FlexLayout className="flex-col gap-2">
              {rows.map(({ vehicle, latestStop }) => (
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
