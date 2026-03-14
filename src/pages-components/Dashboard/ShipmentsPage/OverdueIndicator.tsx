import { Shipment } from '@/lib/api';
import { useClient } from '@/lib/hooks';
import { getDateTimeInLocalTimezone } from '@/lib/utils/date';
import { getShipmentOverdueInfo } from '@/lib/utils/shipments';
import { Box, FlexLayout, Icon, Text, Tooltip } from '@/ui';

type OverdueIndicatorVariant = 'default' | 'compact';

interface OverdueIndicatorProps {
  shipment: Shipment;
  variant?: OverdueIndicatorVariant;
}

export const OverdueIndicator: React.FC<OverdueIndicatorProps> = ({ shipment, variant = 'default' }) => {
  const { data: client } = useClient(shipment.clientId || '');

  const { isOverdue, dueDate, daysOverdue } = getShipmentOverdueInfo({
    invoiceStatus: shipment.invoiceStatus,
    invoiceStatusUpdatedAt: shipment.invoiceStatusUpdatedAt,
    termsOfPayment: client?.termsOfPayment,
  });

  if (!isOverdue) return null;

  const formattedDueDate = dueDate ? getDateTimeInLocalTimezone(dueDate.toISOString(), 'DD.MM.YYYY') : '';
  const overdueMessage =
    daysOverdue > 0
      ? `Valuta istekla prije ${daysOverdue} ${daysOverdue === 1 ? 'dan' : 'dana'} (${formattedDueDate}).`
      : `Valuta istekla (${formattedDueDate}).`;

  return (
    <Tooltip
      content={
        <Box className="px-2">
          <Text as="p" color="text-light-50" variant="text-xs">
            {overdueMessage}
          </Text>
        </Box>
      }
    >
      <FlexLayout className="items-center gap-1 cursor-default">
        <Icon color="text-orange-500 dark:text-orange-400" icon="ExclamationTriangleIcon" size="m" />
        {variant === 'default' && (
          <Text className="text-orange-500 dark:text-orange-400" variant="text-s-medium">
            Dospjelo
          </Text>
        )}
      </FlexLayout>
    </Tooltip>
  );
};
