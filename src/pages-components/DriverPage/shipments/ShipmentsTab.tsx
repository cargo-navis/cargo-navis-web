import { useState } from 'react';

import type { DriverShipmentSummary } from '@/lib/api/driver';
import { Button, FlexLayout, LoadingSpinner, Text } from '@/ui';

import { InfiniteListFooter, type InfinitePagination } from '../layout/InfiniteListFooter';
import { ShipmentCard, ShipmentSheet } from './ShipmentCard';

interface ShipmentsTabProps {
  /** Latest first; undefined until the first page loads. */
  shipments: DriverShipmentSummary[] | undefined;
  isError: boolean;
  onRetry(): void;
  pagination: InfinitePagination;
  /** The order whose sheet is open; a notification tap opens one from outside. */
  openShipmentId: string | null;
  onOpenShipmentChange(shipmentId: string | null): void;
}

export const ShipmentsTab: React.FC<ShipmentsTabProps> = ({
  shipments,
  isError,
  onRetry,
  pagination,
  openShipmentId,
  onOpenShipmentChange,
}) => {
  // The sheet keeps the last order while closing, so its content doesn't vanish mid-animation.
  const [sheetShipmentId, setSheetShipmentId] = useState(openShipmentId);
  if (openShipmentId && openShipmentId !== sheetShipmentId) setSheetShipmentId(openShipmentId);

  function renderList() {
    if (!shipments && isError) {
      return (
        <FlexLayout className="flex-col items-center gap-2 py-8">
          <Text color="text-color-3" variant="text-s">
            Nalozi se nisu učitali.
          </Text>
          <Button size="m" text="Pokušaj ponovno" variant="secondary" onClick={onRetry} />
        </FlexLayout>
      );
    }

    if (!shipments) {
      return (
        <FlexLayout className="justify-center py-8">
          <LoadingSpinner />
        </FlexLayout>
      );
    }

    if (shipments.length === 0) {
      return (
        <Text className="py-8 text-center" color="text-color-3" variant="text-s">
          Nemaš naloga.
        </Text>
      );
    }

    return (
      <>
        {shipments.map((shipment) => (
          <ShipmentCard key={shipment.id} shipment={shipment} onOpen={() => onOpenShipmentChange(shipment.id)} />
        ))}
        <InfiniteListFooter pagination={pagination} />
      </>
    );
  }

  return (
    <FlexLayout className="flex-col gap-3 p-4">
      {renderList()}
      <ShipmentSheet
        isOpen={!!openShipmentId}
        shipmentId={sheetShipmentId}
        summary={shipments?.find((shipment) => shipment.id === sheetShipmentId) ?? null}
        onOpenChange={(isOpen) => {
          if (!isOpen) onOpenShipmentChange(null);
        }}
      />
    </FlexLayout>
  );
};
