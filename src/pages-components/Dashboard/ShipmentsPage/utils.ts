import type { Shipment } from '@/lib/api';

export function organizeSubshipments(data: Shipment[]) {
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
}
