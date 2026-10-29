import { useMemo } from 'react';

import type { DriverStop } from '@/lib/api/driver';
import { FlexLayout, Text } from '@/ui';

import { buildDriverShipments } from '../utils';
import { ShipmentCard } from './ShipmentCard';

interface ShipmentsTabProps {
  stops: DriverStop[];
  /** The order whose sheet is open; a notification tap opens one from outside. */
  openShipmentId: string | null;
  onOpenShipmentChange(shipmentId: string | null): void;
}

export const ShipmentsTab: React.FC<ShipmentsTabProps> = ({ stops, openShipmentId, onOpenShipmentChange }) => {
  const shipments = useMemo(() => buildDriverShipments(stops), [stops]);
  return (
    <FlexLayout className="flex-col gap-3 p-4">
      {shipments.length === 0 && (
        <Text className="py-8 text-center" color="text-color-3" variant="text-s">
          Nemaš aktivnih naloga.
        </Text>
      )}
      {shipments.map((shipment) => (
        <ShipmentCard
          isOpen={shipment.id === openShipmentId}
          key={shipment.id}
          shipment={shipment}
          onOpenChange={(isOpen) => onOpenShipmentChange(isOpen ? shipment.id : null)}
        />
      ))}
    </FlexLayout>
  );
};
