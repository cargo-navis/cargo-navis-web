import { EmployeeName } from '@/components/employees/EmployeeName';
import { Shipment } from '@/lib/api';
import { getDataPointDateString } from '@/lib/utils/date';
import { Box, Divider, FlexLayout, Text } from '@/ui';

import { EmptyShipmentVehicleStops } from './EmptyShipmentVehicleStops';
import { ShipmentVehicleStops } from './ShipmentVehicleStops';

interface ShipmentLeftPanelProps {
  shipment: Shipment;
  onAssignClick(): void;
}

const cardClass = 'rounded-m border border-dark-200 dark:border-light-800 p-4';

export const ShipmentLeftPanel = ({ shipment, onAssignClick }: ShipmentLeftPanelProps) => {
  const isAgency = (shipment.children?.length ?? 0) > 0;
  const isAssigned = (shipment.vehicleStops?.length ?? 0) > 0;

  const child = shipment.children?.[0];
  const transportPrice = child?.price;
  const ruc = transportPrice !== undefined ? shipment.price - transportPrice : undefined;
  const rucClass =
    ruc !== undefined && ruc < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';

  return (
    <FlexLayout as="section" className="flex-col gap-4">
      <Box className={cardClass}>
        <FlexLayout className="flex-col gap-3">
          <Text color="text-color-2" variant="text-m-medium">
            Reference
          </Text>
          <FlexLayout className="items-center justify-between">
            <Text color="text-color-3" variant="text-xs-medium">
              Vanjska referenca
            </Text>
            <Text color="text-color-1" variant="text-s-medium">
              {shipment.externalOrderReference || '—'}
            </Text>
          </FlexLayout>
          <FlexLayout className="items-center justify-between">
            <Text color="text-color-3" variant="text-xs-medium">
              Kreirano
            </Text>
            <Text color="text-color-1" variant="text-s-medium">
              {getDataPointDateString(shipment.createdAt)}
            </Text>
          </FlexLayout>
          {shipment.createdById && (
            <FlexLayout className="items-center justify-between">
              <Text color="text-color-3" variant="text-xs-medium">
                Kreirao
              </Text>
              <EmployeeName color="text-color-1" id={shipment.createdById} variant="text-s-medium" />
            </FlexLayout>
          )}
        </FlexLayout>
      </Box>

      <Box className={cardClass}>
        <FlexLayout className="flex-col gap-1">
          <Text color="text-color-2" variant="text-m-medium">
            Financije
          </Text>
          <FlexLayout className="items-center justify-between">
            <Text color="text-color-3" variant="text-xs-medium">
              Cijena
            </Text>
            <Text className="text-green-500 dark:text-green-400" variant="text-l-medium">
              {shipment.price}€
            </Text>
          </FlexLayout>
          {transportPrice !== undefined && ruc !== undefined && (
            <>
              <FlexLayout className="items-center justify-between">
                <Text color="text-color-3" variant="text-xs-medium">
                  Cijena transporta
                </Text>
                <Text className="text-red-500 dark:text-red-400" variant="text-l-medium">
                  -{transportPrice}€
                </Text>
              </FlexLayout>
              <Divider />
              <FlexLayout className="items-center justify-between">
                <Text color="text-color-3" variant="text-xs-medium">
                  RUC
                </Text>
                <Text className={rucClass} variant="text-l-medium">
                  {ruc}€
                </Text>
              </FlexLayout>
            </>
          )}
        </FlexLayout>
      </Box>

      {!isAgency && (
        <Box className={cardClass}>
          {isAssigned && shipment.vehicleStops ? (
            <ShipmentVehicleStops stops={shipment.vehicleStops} />
          ) : (
            <EmptyShipmentVehicleStops onAssignClick={onAssignClick} />
          )}
        </Box>
      )}
    </FlexLayout>
  );
};
