import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Timeline } from '@/components/reui/timeline';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useVehicles } from '@/lib/hooks';
import { useDeleteVehicleStop, useRearrangeVehicleStop, useVehicleStops } from '@/lib/hooks/api/vehicleStops';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { ContentLoader, StopSkeleton } from './ContentLoader';
import { VehicleStopModal } from './VehicleStopModal';
import { VerticalStopEntry } from './VerticalStopEntry';

export const VehicleStopDetailPage = () => {
  const { query } = useRouter();
  const vehicleId = query.vehicleId as string;

  const {
    data,
    isPending: isLoadingStops,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVehicleStops(vehicleId);
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { mutateAsync: deleteStop } = useDeleteVehicleStop();
  const { mutate: rearrangeStop } = useRearrangeVehicleStop(vehicleId);

  const vehicle = useMemo(() => vehicles?.find((v) => v.id === vehicleId), [vehicles, vehicleId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<VehicleStop | undefined>(undefined);
  const [previousStop, setPreviousStop] = useState<VehicleStop | undefined>(undefined);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const stops = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const lastCompletedStopIndex = useMemo(() => {
    for (let i = 0; i < stops.length; i++) {
      if (isStopCompleted(stops[i])) return i;
    }
    return -1;
  }, [stops]);

  const activeDragStop = useMemo(
    () => (activeDragId ? stops.find((s) => s.id === activeDragId) : undefined),
    [activeDragId, stops]
  );
  const activeDragStep = activeDragStop ? stops.findIndex((s) => s.id === activeDragStop.id) + 1 : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(stops, oldIndex, newIndex);
    const previousStopId = reordered[newIndex + 1]?.id ?? null;
    rearrangeStop(
      { stopId: active.id as string, previousStopId },
      {
        onSuccess: () => showSuccessToast({ title: 'Stanica premještena.' }),
        onError: (error) => {
          const code = (error as AxiosError<{ errorCode?: string }>)?.response?.data?.errorCode;
          if (code === 'INVALID_STOP_POSITION') {
            showErrorToast({
              title: 'Premještanje nije dozvoljeno',
              description: 'Preslagivanje je dozvoljeno samo unutar istog datuma ili među stanicama bez datuma.',
              timeout: 6000,
            });
            return;
          }
          showErrorToast({ title: 'Greška prilikom premještanja stanice. Pokušajte ponovno.' });
        },
      }
    );
  }

  function handleDragCancel() {
    setActiveDragId(null);
  }

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  async function handleDelete(stop: VehicleStop) {
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
        <ContentLoader />
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout>
        <FlexLayout className="py-5 flex-col gap-5">
          <BackButton forceTarget targetLocation="/dashboard/vehicle-stops" />
          <Text color="text-color-3" variant="text-s">
            Vozilo nije pronađeno.
          </Text>
        </FlexLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTitle title={vehicle?.registration} type="Prijevoz" />
      <FlexLayout className="py-5 flex-col gap-5">
        <BackButton forceTarget targetLocation="/dashboard/vehicle-stops" />

        <Box>
          <Text as="h1" color="text-color-1" variant="text-xl-medium">
            {vehicle.registration}
          </Text>
          <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
            <Icon icon="IconTruckDelivery" size="l" />
            <Text variant="text-m">{vehicle.brand}</Text>
          </FlexLayout>
        </Box>

        <Box className="max-w-[1200px] -ml-6">
          <Box className="relative ml-6">
            <FlexLayout
              as="button"
              className="items-center gap-4 mb-6 text-teal-500 hover:text-teal-700 border-teal-500 hover:border-teal-700"
              onClick={openCreateModal}
            >
              <FlexLayout className="items-center justify-center w-[32px] h-[32px] shrink-0 -ml-2 rounded-circle border-2 border-dashed border-inherit">
                <Icon className="text-inherit" icon="IconPlus" size="m" />
              </FlexLayout>
              <Text color="text-inherit" variant="text-s-medium">
                Dodaj novu stanicu
              </Text>
            </FlexLayout>
          </Box>
          <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <Timeline className="w-full" defaultValue={stops.length}>
              <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {stops.map((stop, i) => (
                  <VerticalStopEntry
                    isLastCompleted={i === lastCompletedStopIndex}
                    key={stop.id}
                    step={i + 1}
                    stop={stop}
                    onDelete={handleDelete}
                    onEdit={openEditModal}
                    onInsertBefore={() => openInsertBeforeModal(stops[i + 1])}
                  />
                ))}
              </SortableContext>
            </Timeline>
            <DragOverlay dropAnimation={null}>
              {activeDragStop ? (
                <Box className="bg-white dark:bg-black shadow-lg rounded-md opacity-90">
                  <Timeline defaultValue={activeDragStep} orientation="vertical">
                    <VerticalStopEntry isDragOverlay step={activeDragStep} stop={activeDragStop} />
                  </Timeline>
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
          <Box className="h-1" ref={sentinelRef} />
          {isFetchingNextPage && <StopSkeleton isLast />}
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
