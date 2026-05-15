import Fuse from 'fuse.js';
import { useMemo } from 'react';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useClients, useShipmentsData } from '@/lib/hooks';

import { buildAddressKey, formatAddressLabel } from './addressHelpers';

type AddressOption = { value: string; label: string; helper?: string };

export function useAddressOptions(stop?: VehicleStop) {
  const { data: shipments = [] } = useShipmentsData({ params: { isActive: true } });
  const { data: clients = [] } = useClients();

  const addressOptions = useMemo<AddressOption[]>(() => {
    const clientsById = new Map(clients.map((c) => [c.id, c.name]));
    const seen = new Map<string, AddressOption>();

    shipments.forEach((s) => {
      const clientName = s.clientId ? clientsById.get(s.clientId) : undefined;
      const helper = [s.orderNumber, clientName].filter(Boolean).join(' · ');

      s.cargo.forEach((c) => {
        [c.loadingAddress, c.unloadingAddress].forEach((a) => {
          if (!a) return;
          const key = buildAddressKey(s.id, a.postalCodeId);
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

  const filterAddressOption = useMemo(() => {
    const fuse = new Fuse(addressOptions, {
      keys: ['label', 'helper'],
      threshold: 0.2,
      ignoreLocation: true,
      ignoreDiacritics: true,
    });
    let lastInput: string | null = null;
    let lastMatches: Set<string> = new Set();

    return (option: { data: AddressOption }, input: string) => {
      if (!input?.trim()) return true;
      if (input !== lastInput) {
        lastInput = input;
        lastMatches = new Set(fuse.search(input).map((r) => r.item.value));
      }
      return lastMatches.has(option.data.value);
    };
  }, [addressOptions]);

  return { shipments, addressOptions, filterAddressOption };
}
