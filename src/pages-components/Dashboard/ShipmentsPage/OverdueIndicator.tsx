import { Shipment } from '@/lib/api';
import { useClient } from '@/lib/hooks';
import { getDateTimeInLocalTimezone } from '@/lib/utils/date';
import { getShipmentOverdueInfo } from '@/lib/utils/shipments';
import { Box, FlexLayout, Icon, Text, Tooltip } from '@/ui';

interface OverdueIndicatorProps {
  shipment: Shipment;
}

export const OverdueIndicator: React.FC<OverdueIndicatorProps> = ({ shipment }) => {
  const { data: client } = useClient(shipment.clientId || '');

  const { isOverdue, dueDate, daysOverdue } = getShipmentOverdueInfo({
    invoiceStatus: shipment.invoiceStatus,
    invoiceStatusUpdatedAt: shipment.invoiceStatusUpdatedAt,
    termsOfPayment: client?.termsOfPayment,
  });

  if (!isOverdue) return null;

  return (
    <Tooltip
      content={
        <Box className="px-2 py-1">
          <Text as="p" color="text-light-50" variant="text-xs">
            Nalog dospio prije {daysOverdue} {daysOverdue === 1 ? 'dan' : 'dana'} (
            {dueDate ? getDateTimeInLocalTimezone(dueDate.toISOString(), 'DD.MM.YYYY') : ''}).
          </Text>
        </Box>
      }
    >
      <FlexLayout className="items-center gap-1 cursor-default">
        <Icon color="text-red-500" icon="ExclamationTriangleIcon" />
        <Text className="text-red-500" variant="text-s-medium">
          Dospjelo
        </Text>
      </FlexLayout>
    </Tooltip>
  );
};
