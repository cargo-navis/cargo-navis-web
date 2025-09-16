import { Shipment } from '@/lib/api/shipments.d';
import { useEmployee, useSendShipmentToDriver } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { FlexLayout, Text, TextButton } from '@/ui';

export const SendToDriver = ({ shipment }: { shipment: Shipment }) => {
  const { mutateAsync: sendToDriver, isPending } = useSendShipmentToDriver(shipment.id);
  const { data: driver } = useEmployee(shipment.driverId as string);

  if (!driver?.messageChannel) return null;

  async function handleSendToDriver() {
    try {
      await sendToDriver({ driverId: shipment.driverId as string, sentToDriver: true });
      showSuccessToast({ title: `Nalog ${shipment.orderNumber} poslan vozaču ${driver?.fullName}` });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška s poslanim nalogu vozaču' });
    }
  }

  if (shipment.sentToDriver) {
    return (
      <FlexLayout className="mb-2">
        <Text as="small" color="text-color-3" variant="text-s">
          Nalog poslan vozaču.
        </Text>
      </FlexLayout>
    );
  }

  return (
    <FlexLayout className="gap-3 items-center mb-2">
      <Text as="small" color="text-color-3" variant="text-s">
        Nalog nije poslan vozaču.
      </Text>
      <TextButton
        iconRight="ArrowUpRightIcon"
        isDisabled={isPending}
        size="s"
        text={isPending ? 'Šalje se...' : 'Pošalji'}
        variant="secondary"
        onClick={handleSendToDriver}
      />
    </FlexLayout>
  );
};
