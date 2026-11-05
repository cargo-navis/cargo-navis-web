import { FileCardList, type FileCardListItem } from '@/components/files/FileCardList';
import { useShipmentFileActions, useVehicleStopFileActions } from '@/components/files/useFileActions';
import type { Shipment } from '@/lib/api';
import { FlexLayout } from '@/ui';

import { ShipmentFileUploadButton } from './ShipmentFileUploadButton';

/**
 * The order's files and the files uploaded on its stops (e.g. a driver's CMR photo) in one list, each acting through
 * the endpoints of where it was uploaded. New files are uploaded to the order.
 */
export const ShipmentFiles = ({ shipment, isDisabled }: { shipment: Shipment; isDisabled?: boolean }) => {
  const shipmentActions = useShipmentFileActions(shipment.id, shipment.isAgency);
  const getStopActions = useVehicleStopFileActions();

  const shipmentFileActions = { ...shipmentActions, isLoading: shipmentActions.isLoading || !!isDisabled };
  const shipmentFiles: FileCardListItem[] = (shipment.documents ?? []).map((document) => ({
    document,
    actions: shipmentFileActions,
  }));

  const stopFiles: FileCardListItem[] = (shipment.vehicleStops ?? []).flatMap((stop) => {
    const stopFileActions = getStopActions(stop.id);
    return (stop.documents ?? []).map((document) => ({ document, actions: stopFileActions }));
  });

  const items = [...shipmentFiles, ...stopFiles];

  return (
    <FlexLayout className="mt-2 flex-wrap gap-4">
      <FileCardList items={items} />
      <ShipmentFileUploadButton id={shipment.id} isAgency={shipment.isAgency} />
    </FlexLayout>
  );
};
