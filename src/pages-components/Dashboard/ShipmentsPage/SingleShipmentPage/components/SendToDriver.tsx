import { Shipment } from '@/lib/api/shipments.d';
import { useEmployee, useSendShipmentToDriver } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, FlexLayout, Icon, Text, TextButton } from '@/ui';

export const SendToDriver = ({ shipment }: { shipment: Shipment }) => {
  const { mutateAsync: sendToDriver, isPending } = useSendShipmentToDriver(shipment.id);
  const { data: driver } = useEmployee(shipment.driverId as string);

  if (!driver?.messageChannel) {
    return <Box className="h-[24px] mb-2" />;
  }

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
      <FlexLayout className="gap-1 items-center mb-2 text-dark-600 dark:text-light-300">
        <Icon icon="CheckCircleIcon" size="m" />
        <Text as="small" variant="text-s">
          Nalog poslan vozaču.
        </Text>
      </FlexLayout>
    );
  }

  return (
    <FlexLayout className="gap-3 items-center mb-2">
      <FlexLayout className="gap-1 items-center text-orange-500">
        <Icon icon="ExclamationTriangleIcon" size="m" />
        <Text as="small" variant="text-s">
          Nalog nije poslan vozaču.
        </Text>
      </FlexLayout>
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
