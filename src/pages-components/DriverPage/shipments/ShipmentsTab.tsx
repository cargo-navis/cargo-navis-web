import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { DriverShipmentSummary } from '@/lib/api/driver';
import { Icon } from '@/ui';

import { InfiniteListFooter, type InfinitePagination } from '../layout/InfiniteListFooter';
import { DriverEmpty } from '../ui';
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
        <DriverEmpty
          action={
            <Button size="xl" variant="outline" onClick={onRetry}>
              <Icon data-icon="inline-start" icon="IconReload" size="m" />
              Pokušaj ponovno
            </Button>
          }
          icon="IconAlertTriangle"
          title="Nalozi se nisu učitali."
          variant="danger"
        />
      );
    }

    // First load: card-shaped placeholders (title, number, route, progress).
    if (!shipments) {
      return Array.from({ length: 3 }, (_, index) => (
        <div aria-busy className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10" key={index}>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ));
    }

    if (shipments.length === 0) {
      return <DriverEmpty icon="IconClipboardText" title="Nemaš naloga." />;
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
    <div className="flex flex-col gap-2 px-4 pt-1 pb-4">
      {renderList()}
      <ShipmentSheet
        isOpen={!!openShipmentId}
        shipmentId={sheetShipmentId}
        summary={shipments?.find((shipment) => shipment.id === sheetShipmentId) ?? null}
        onOpenChange={(isOpen) => {
          if (!isOpen) onOpenShipmentChange(null);
        }}
      />
    </div>
  );
};
