import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { useShipments } from '@/lib/hooks';
import { Box, Button, FlexLayout, Heading, Text } from '@/ui';

import { ShipmentsTable } from './ShipmentsTable';

export const ShipmentsPage = () => {
  const { data: shipments, isLoading } = useShipments<Shipment[]>({
    select: (data) => {
      // Create a map to store parent shipments and their subshipments
      const shipmentMap = new Map<string, Shipment & { subshipments?: Shipment[] }>();
      const subshipments = new Set<string>();

      // First pass: Create all shipment entries and identify subshipments
      data.forEach((shipment) => {
        shipmentMap.set(shipment.id, { ...shipment });
        if (shipment.parentShipmentId) {
          subshipments.add(shipment.id);
        }
      });

      // Second pass: Organize subshipments under their parents
      data.forEach((shipment) => {
        if (shipment.parentShipmentId && shipmentMap.has(shipment.parentShipmentId)) {
          const parentShipment = shipmentMap.get(shipment.parentShipmentId)!;
          if (!parentShipment.subshipments) {
            parentShipment.subshipments = [];
          }
          parentShipment.subshipments.push(shipment);
        }
      });

      // Return only parent shipments (those that are not subshipments)
      return Array.from(shipmentMap.values()).filter((shipment) => !subshipments.has(shipment.id));
    },
  });

  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="items-center justify-between">
          <Heading as="h1" variant="text-xl">
            Nalozi
          </Heading>
          <Button as="a" href="/dashboard/shipments/new" iconLeft="PlusIcon" text="Dodaj Nalog" />
        </FlexLayout>
      </Box>
      <Box className="py-5">{isLoading ? <Text>Loading...</Text> : <ShipmentsTable shipments={shipments} />}</Box>
    </DashboardLayout>
  );
};
