import { useAlerts } from '@/lib/hooks';
import { FlexLayout, LoadingSpinner, Text } from '@/ui';

import { AlertItem } from './AlertItem';
import { DashboardCard } from './DashboardCard';

export const AlertsCard = () => {
  const { data: alerts, isLoading } = useAlerts();

  let title = 'Upozorenja';
  if (alerts?.length) title += ` (${alerts.length})`;

  return (
    <DashboardCard icon="IconAlertTriangle" iconColor="text-red-500 dark:text-red-300" title={title}>
      {isLoading ? (
        <FlexLayout className="h-full items-center justify-center">
          <LoadingSpinner />
        </FlexLayout>
      ) : !alerts?.length ? (
        <FlexLayout className="h-full items-center justify-center">
          <Text color="text-color-3" variant="text-m">
            Nema novih upozorenja
          </Text>
        </FlexLayout>
      ) : (
        <FlexLayout className="h-full flex-col gap-3 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <AlertItem alert={alert} key={alert.alertable.id + alert.createdAt} />
          ))}
        </FlexLayout>
      )}
    </DashboardCard>
  );
};
