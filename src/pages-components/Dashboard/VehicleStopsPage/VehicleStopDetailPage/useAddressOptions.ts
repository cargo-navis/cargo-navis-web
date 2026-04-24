import { useMemo } from 'react';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useClients, useShipmentsData } from '@/lib/hooks';

import { buildAddressKey, formatAddressLabel } from './addressHelpers';

export function useAddressOptions(stop?: VehicleStop) {
  const { data: shipments = [] } = useShipmentsData({ params: { active: true } });
  const { data: clients = [] } = useClients();

  const addressOptions = useMemo(() => {
    const clientsById = new Map(clients.map((c) => [c.id, c.name]));
    const seen = new Map<string, { value: string; label: string; helper?: string }>();

    shipments.forEach((s) => {
      const clientName = s.clientId ? clientsById.get(s.clientId) : undefined;
      const helper = [s.orderNumber, clientName].filter(Boolean).join(' · ');
      s.cargo.forEach((c) => {
        [c.loadingAddress, c.unloadingAddress].forEach((a) => {
          if (!a) return;
          const key = buildAddressKey(s.id, a.id);
          if (!seen.has(key)) seen.set(key, { value: key, label: formatAddressLabel(a), helper });
        });
      });
    });

    if (stop?.address) {
      const key = buildAddressKey(stop.id, stop.address.id);
      if (!seen.has(key)) seen.set(key, { value: key, label: formatAddressLabel(stop.address) });
    }

    return Array.from(seen.values());
  }, [shipments, clients, stop]);

  return { shipments, addressOptions };
}
