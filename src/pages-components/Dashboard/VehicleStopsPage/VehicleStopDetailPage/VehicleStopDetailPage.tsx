import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Timeline } from '@/components/reui/timeline';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicles } from '@/lib/hooks';
import { useDeleteVehicleStop, useVehicleStopsByVehicle } from '@/lib/hooks/api/vehicleStops';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { VehicleStopModal } from './VehicleStopModal';
import { VerticalStopEntry } from './VerticalStopEntry';

export const VehicleStopDetailPage = () => {
  const { query } = useRouter();
  const vehicleId = query.vehicleId as string;

  const { data: groups, isLoading: isLoadingStops } = useVehicleStopsByVehicle(10);
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { mutateAsync: deleteStop } = useDeleteVehicleStop();

  const group = useMemo(() => groups?.find((g) => g.vehicleId === vehicleId), [groups, vehicleId]);
  const vehicle = useMemo(() => vehicles?.find((v) => v.id === vehicleId), [vehicles, vehicleId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<VehicleStop | undefined>(undefined);
  const [previousStop, setPreviousStop] = useState<VehicleStop | undefined>(undefined);

  const stops = group?.stops ?? [];

  const isLoading = isLoadingStops || isLoadingVehicles;

  function openCreateModal() {
    setEditingStop(undefined);
    setPreviousStop(stops[0]);
    setIsModalOpen(true);
  }

  function openEditModal(stop: VehicleStop) {
    setEditingStop(stop);
    setPreviousStop(undefined);
    setIsModalOpen(true);
  }

  function openInsertBeforeModal(prev: VehicleStop | undefined) {
    setEditingStop(undefined);
    setPreviousStop(prev);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingStop(undefined);
    setPreviousStop(undefined);
  }

  async function _handleDelete(stop: VehicleStop) {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovu stanicu?');
    if (!answer) return;

    try {
      await deleteStop(stop.id);
      showSuccessToast({ title: 'Stanica izbrisana' });
    } catch {
      showErrorToast({ title: 'Greška s brisanjem stanice' });
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingPage />
      </DashboardLayout>
    );
  }

  if (!vehicle || !group) {
    return (
      <DashboardLayout>
        <FlexLayout className="py-5 flex-col gap-5">
          <BackButton targetLocation="/dashboard/vehicle-stops" />
          <Text color="text-color-3" variant="text-s">
            Vozilo nije pronađeno.
          </Text>
        </FlexLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FlexLayout className="py-5 flex-col gap-5">
        <BackButton targetLocation="/dashboard/vehicle-stops" />

        <Box>
          <Text as="h1" color="text-color-1" variant="text-xl-medium">
            {vehicle.registration}
          </Text>
          <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
            <Icon icon="TruckIcon" size="l" />
            <Text variant="text-m">{vehicle.brand}</Text>
          </FlexLayout>
        </Box>

        <Box className="max-w-xl">
          <Box className="relative">
            <FlexLayout
              as="button"
              className="items-center gap-4 mb-6 text-teal-500 hover:text-teal-700 border-teal-500 hover:border-teal-700"
              onClick={openCreateModal}
            >
              <FlexLayout className="items-center justify-center w-[32px] h-[32px] shrink-0 -ml-2 rounded-circle border-2 border-dashed border-inherit">
                <Icon className="text-inherit" icon="PlusIcon" size="m" />
              </FlexLayout>
              <Text color="text-inherit" variant="text-s-medium">
                Dodaj novu stanicu
              </Text>
            </FlexLayout>
          </Box>
          <Timeline className="w-full" defaultValue={stops.length} orientation="vertical">
            {stops.map((stop, i) => (
              <VerticalStopEntry
                completed
                key={stop.id}
                separatorActive
                step={i + 1}
                stop={stop}
                // onDelete={handleDelete} TODO - enable once we decide how to handle this on BE
                onEdit={openEditModal}
                onInsertBefore={() => openInsertBeforeModal(stops[i + 1])}
              />
            ))}
          </Timeline>
        </Box>
      </FlexLayout>
      <VehicleStopModal
        isOpen={isModalOpen}
        previousStop={previousStop}
        stop={editingStop}
        vehicleId={vehicleId}
        onClose={closeModal}
      />
    </DashboardLayout>
  );
};
