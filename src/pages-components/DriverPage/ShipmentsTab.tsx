import { useMemo } from 'react';

import type { DriverStop } from '@/lib/api/driver';
import { FlexLayout, Text } from '@/ui';

import { ShipmentCard } from './ShipmentCard';
import { buildDriverShipments } from './utils';

export const ShipmentsTab: React.FC<{ stops: DriverStop[] }> = ({ stops }) => {
  const shipments = useMemo(() => buildDriverShipments(stops), [stops]);
  return (
    <FlexLayout className="flex-col gap-3 p-4">
      {shipments.length === 0 && (
        <Text className="py-8 text-center" color="text-color-3" variant="text-s">
          Nemaš aktivnih naloga.
        </Text>
      )}
      {shipments.map((shipment) => (
        <ShipmentCard key={shipment.id} shipment={shipment} />
      ))}
    </FlexLayout>
  );
};
