import groupBy from 'lodash/groupBy';

import type { VehicleEnum } from '@/lib/api';
import { useAlertByVehicleType } from '@/lib/hooks';
import { Icon } from '@/ui';

import { AlertsTooltip } from './AlertsTooltip';

interface VehicleAlertTooltip {
  id: string;
  type: VehicleEnum;
}

export const VehicleAlertTooltip: React.FC<VehicleAlertTooltip> = ({ id, type }) => {
  const { data } = useAlertByVehicleType(type);
  const groupedAlerts = groupBy(data || [], 'alertable.id');

  const vehicleAlerts = groupedAlerts[id];

  if (!vehicleAlerts || !vehicleAlerts.length) {
    return null;
  }

  return (
    <AlertsTooltip alerts={vehicleAlerts}>
      <Icon icon="ExclamationTriangleIcon" size="l" color="text-red-500" />
    </AlertsTooltip>
  );
};
