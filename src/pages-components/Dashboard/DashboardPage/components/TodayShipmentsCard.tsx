import 'dayjs/locale/hr';

import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import type { Cargo, Shipment } from '@/lib/api/shipments.d';
import { useContractors, useShipmentsData } from '@/lib/hooks';
import { getCargoLabel } from '@/lib/utils/cargo';
import { isToday } from '@/lib/utils/date';
import { Box, FlexLayout, Icon, LoadingSpinner, Pill, Text, Tooltip } from '@/ui';

import { DashboardCard } from './DashboardCard';

dayjs.locale('hr');

export const TodayShipmentsCard = () => {
  const today = dayjs().format('YYYY-MM-DD');

  const longDate = dayjs().format('dddd, D. MMMM YYYY.');
  const formattedDate = longDate.charAt(0).toUpperCase() + longDate.slice(1);

  // A shipment has no single "date"; each cargo carries loadingReadyDate and
  // unloadingDueDate. Backend ANDs the two date-range pairs, so "loading OR
  // unloading today" needs two queries that we merge and dedupe by id.
  const { data: loadingToday, isLoading: isLoadingLoad } = useShipmentsData({
    params: { loadingReadyDateFrom: today, loadingReadyDateTo: today, size: 100 },
  });
  const { data: unloadingToday, isLoading: isLoadingUnload } = useShipmentsData({
    params: { unloadingDueDateFrom: today, unloadingDueDateTo: today, size: 100 },
  });

  const isLoading = isLoadingLoad || isLoadingUnload;

  const { data: contractors = [] } = useContractors();
  const contractorNameById = new Map(contractors.map((contractor) => [contractor.id, contractor.name]));

  const byId = new Map<string, Shipment>();
  for (const shipment of [...(loadingToday ?? []), ...(unloadingToday ?? [])]) {
    byId.set(shipment.id, shipment);
  }
  const todayShipments = Array.from(byId.values());

  return (
    <DashboardCard
      icon="IconFileDescription"
      iconColor="text-blue-600"
      subtitle={
        <Text color="text-color-3" variant="text-xxs">
          {formattedDate}
        </Text>
      }
      title="Današnji nalozi"
    >
      {isLoading ? (
        <FlexLayout className="h-full items-center justify-center">
          <LoadingSpinner />
        </FlexLayout>
      ) : todayShipments.length === 0 ? (
        <FlexLayout className="h-full items-center justify-center">
          <Text color="text-color-3" variant="text-m">
            Nema naloga za danas
          </Text>
        </FlexLayout>
      ) : (
        <FlexLayout className="h-full flex-col gap-3 overflow-y-auto pr-1">
          {todayShipments.map((shipment) => (
            <TodayShipmentRow
              key={shipment.id}
              shipment={shipment}
              transporterName={contractorNameById.get(shipment.children?.[0]?.transportContractorId ?? '')}
            />
          ))}
        </FlexLayout>
      )}
    </DashboardCard>
  );
};

const ShipmentNotes = ({ internalNote, externalNote }: { internalNote?: string; externalNote?: string }) => {
  if (!internalNote && !externalNote) return null;

  return (
    <Tooltip
      content={
        <FlexLayout className="flex-col gap-2 px-1 max-w-[280px]">
          {internalNote && (
            <FlexLayout className="flex-col gap-0.5">
              <Text color="text-light-300" variant="text-xxxs-medium">
                INTERNA NAPOMENA
              </Text>
              <Text className="whitespace-break-spaces" color="text-light-50" variant="text-xs">
                {internalNote}
              </Text>
            </FlexLayout>
          )}
          {externalNote && (
            <FlexLayout className="flex-col gap-0.5">
              <Text color="text-light-300" variant="text-xxxs-medium">
                EKSTERNA NAPOMENA
              </Text>
              <Text className="whitespace-break-spaces" color="text-light-50" variant="text-xs">
                {externalNote}
              </Text>
            </FlexLayout>
          )}
        </FlexLayout>
      }
    >
      <Box className="shrink-0 leading-none text-color-3" onClick={(event) => event.stopPropagation()}>
        <Icon icon="IconInfoCircle" size="m" />
      </Box>
    </Tooltip>
  );
};

type CargoAction = { kind: 'loading' | 'unloading'; cargo: Cargo };

const TodayShipmentRow = ({ shipment, transporterName }: { shipment: Shipment; transporterName?: string }) => {
  const { push } = useRouter();

  // Agency shipment is stored as a parent with an outbound child; the parent is
  // the single order we surface, flagged with a pill.
  const isAgency = (shipment.children?.length ?? 0) > 0;

  const actions: CargoAction[] = (shipment.cargo ?? []).flatMap((cargo) => {
    const cargoActions: CargoAction[] = [];
    if (isToday(cargo.loadingReadyDate)) cargoActions.push({ kind: 'loading', cargo });
    if (isToday(cargo.unloadingDueDate)) cargoActions.push({ kind: 'unloading', cargo });
    return cargoActions;
  });

  return (
    <Box
      className="rounded-m border border-dark-100 dark:border-light-800 p-4 transition-colors hover:bg-dark-50 dark:hover:bg-light-800"
      onClick={() => push(`/dashboard/shipments/${shipment.id}`)}
    >
      {isAgency && (
        <Box className="mb-2">
          <Pill
            size="s"
            text={transporterName ? `Agencijski nalog: ${transporterName}` : 'Agencijski nalog'}
            variant="warning"
          />
        </Box>
      )}
      <FlexLayout className="items-center gap-2">
        <Text as="span" color="text-color-1" variant="text-s-bold">
          Nalog {shipment.orderNumber}
        </Text>
        <ShipmentNotes externalNote={shipment.externalNote} internalNote={shipment.internalNote} />
      </FlexLayout>
      <FlexLayout className="flex-col gap-2 mt-2">
        {actions.length === 0 ? (
          <Text color="text-color-3" variant="text-xxs">
            Nema utovara ni istovara
          </Text>
        ) : (
          actions.map(({ kind, cargo }) => (
            <FlexLayout className="flex-col gap-1" key={kind + cargo.id}>
              <Pill
                size="s"
                text={kind === 'loading' ? 'Utovar' : 'Istovar'}
                variant={kind === 'loading' ? 'info' : 'warning'}
              />
              <Text as="span" color="text-color-3" variant="text-xs">
                {getCargoLabel(cargo)}
              </Text>
            </FlexLayout>
          ))
        )}
      </FlexLayout>
    </Box>
  );
};
