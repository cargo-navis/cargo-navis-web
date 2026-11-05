import dayjs from 'dayjs';

import type { Shipment } from '@/lib/api';
import { useClient, useEmployees, useNotifyShipmentDrivers } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, Button, FlexLayout, Text, Tooltip } from '@/ui';

import { getDriversNotifiedToast } from '../../driverNotifications';

export const NotifyDriversButton = ({ shipment }: { shipment: Shipment }) => {
  const { mutateAsync: notifyDrivers, isPending } = useNotifyShipmentDrivers(shipment.id);
  const { data: client } = useClient(shipment.clientId ?? '');
  const { data: employees } = useEmployees({ includeDeleted: true });

  const activeStops = (shipment.vehicleStops ?? []).filter((stop) => !isStopCompleted(stop));
  const driverIds = new Set(activeStops.map((stop) => stop.driverId).filter(Boolean));
  const hasManyDrivers = driverIds.size > 1;

  const lastSentAt = activeStops
    .map((stop) => stop.messageSentAt)
    .filter((sentAt): sentAt is string => !!sentAt)
    .sort()
    .at(-1);

  if (activeStops.length === 0) return null;

  async function handleNotify() {
    if (lastSentAt && !confirm('Vozač je već obaviješten. Pošalji ponovno?')) return;

    try {
      const notifiedStops = await notifyDrivers();
      if (notifiedStops.length === 0) {
        showErrorToast({ title: 'Obavijest nije poslana.', description: 'Nijedna postaja nije dostavljena vozaču.' });
        return;
      }
      showSuccessToast(
        getDriversNotifiedToast({
          notifiedStops,
          employees,
          clientName: client?.name,
          orderNumber: shipment.orderNumber,
        })
      );
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom slanja obavijesti. Pokušajte ponovno.' });
    }
  }

  const driverNoun = hasManyDrivers ? 'vozače' : 'vozača';
  const button = (
    <Button
      iconLeft="IconBellPlus"
      isDisabled={driverIds.size === 0}
      isLoading={isPending}
      text={lastSentAt ? 'Obavijesti ponovno' : `Obavijesti ${driverNoun}`}
      variant="secondary"
      onClick={() => void handleNotify()}
    />
  );

  if (driverIds.size === 0) {
    return (
      <Tooltip
        content={
          <Box className="px-2">
            <Text color="text-light-50" variant="text-xs">
              Vozilo nema dodijeljenog vozača.
            </Text>
          </Box>
        }
      >
        <Box>{button}</Box>
      </Tooltip>
    );
  }

  return (
    <FlexLayout className="relative">
      {button}
      {lastSentAt && (
        <Text className="absolute right-0 top-full mt-1 whitespace-nowrap" color="text-color-3" variant="text-xxxs">
          Poslano {dayjs(lastSentAt).format('DD.MM.YYYY, HH:mm')}
        </Text>
      )}
    </FlexLayout>
  );
};
