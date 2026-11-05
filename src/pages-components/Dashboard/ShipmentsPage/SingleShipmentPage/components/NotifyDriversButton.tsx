import dayjs from 'dayjs';

import type { Shipment, VehicleStop } from '@/lib/api';
import { useClient, useEmployees, useSendShipmentStopsMessage } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, Button, FlexLayout, Text, Tooltip } from '@/ui';

export const NotifyDriversButton = ({ shipment }: { shipment: Shipment }) => {
  const { mutateAsync: notifyDrivers, isPending } = useSendShipmentStopsMessage(shipment.id);
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

  // Names the drivers that were actually notified (the backend skips stops it couldn't deliver).
  function getNotifiedToast(notifiedStops: VehicleStop[]): { title: string; description?: string } {
    const order = client?.name ? `o nalogu za ${client.name}.` : `o nalogu ${shipment.orderNumber}.`;

    const notifiedDriverIds = Array.from(new Set(notifiedStops.map((stop) => stop.driverId).filter(Boolean)));
    const names = notifiedDriverIds
      .map((driverId) => employees?.find((employee) => employee.id === driverId)?.fullName)
      .filter((name): name is string => !!name);

    if (notifiedDriverIds.length > 1) {
      return { title: `Vozači obaviješteni ${order}`, description: names.join(', ') || undefined };
    }
    return { title: names[0] ? `Vozač ${names[0]} obaviješten ${order}` : `Vozač obaviješten ${order}` };
  }

  async function handleNotify() {
    if (lastSentAt && !confirm('Vozač je već obaviješten. Pošalji ponovno?')) return;

    try {
      const notifiedStops = await notifyDrivers();
      if (notifiedStops.length === 0) {
        showErrorToast({ title: 'Obavijest nije poslana.', description: 'Nijedna postaja nije dostavljena vozaču.' });
        return;
      }
      showSuccessToast(getNotifiedToast(notifiedStops));
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
