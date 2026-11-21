import { useMemo } from 'react';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useClients, useShipmentsData } from '@/lib/hooks';

import { buildAddressKey, formatAddressLabel, parseAddressKey } from './addressHelpers';
import { type FormCargo, type FormPostalCode, toFormCargo } from './formValues';

export interface AddressOption {
  value: string;
  label: string;
  /** „2041/2026 · Podravka d.d.”. */
  helper?: string;
}

export interface PickedAddress {
  streetName: string;
  countryCode: string;
  postalCode: FormPostalCode;
  loading: FormCargo[];
  unloading: FormCargo[];
}

/**
 * Addresses to pick from (today's AddressSearchSelect): every loading / unloading address of the active nalozi, plus
 * the stop's own address when editing. Picking one fills the address and the cargo that loads / unloads there.
 */
export function useAddressOptions(stop?: VehicleStop) {
  const { data: shipments = [] } = useShipmentsData({ params: { isActive: true } });
  const { data: clients = [] } = useClients();

  const options = useMemo<AddressOption[]>(() => {
    const clientsById = new Map(clients.map((client) => [client.id, client.name]));
    const seen = new Map<string, AddressOption>();
    shipments.forEach((shipment) => {
      const clientName = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
      const helper = [shipment.orderNumber, clientName].filter(Boolean).join(' · ');
      shipment.cargo.forEach((cargo) => {
        [cargo.loadingAddress, cargo.unloadingAddress].forEach((address) => {
          if (!address) return;
          const key = buildAddressKey(shipment.id, address.postalCodeId);
          if (!seen.has(key)) seen.set(key, { value: key, label: formatAddressLabel(address), helper });
        });
      });
    });
    if (stop?.address) {
      const key = buildAddressKey(stop.id, stop.address.postalCodeId);
      if (!seen.has(key)) seen.set(key, { value: key, label: formatAddressLabel(stop.address) });
    }
    return Array.from(seen.values());
  }, [shipments, clients, stop]);

  /** The address and cargo behind an option; null for the stop's own address (nothing to fill). */
  function resolve(key: string): PickedAddress | null {
    const { shipmentId, addressId } = parseAddressKey(key);
    const shipment = shipments.find((item) => item.id === shipmentId);
    if (!shipment) return null;
    const cargo = shipment.cargo.find(
      (item) => item.loadingAddress?.postalCodeId === addressId || item.unloadingAddress?.postalCodeId === addressId
    );
    const address = cargo?.loadingAddress?.postalCodeId === addressId ? cargo.loadingAddress : cargo?.unloadingAddress;
    if (!address) return null;
    const ref = { id: shipment.id, orderNumber: shipment.orderNumber, clientId: shipment.clientId ?? null };
    return {
      streetName: address.streetName ?? '',
      countryCode: address.countryCode ?? '',
      postalCode: {
        id: address.postalCodeId,
        postalCode: address.postalCode,
        placeName: address.placeName,
        countryCode: address.countryCode,
      },
      loading: shipment.cargo
        .filter((item) => item.loadingAddress?.postalCodeId === addressId)
        .map((item) => toFormCargo(item, ref)),
      unloading: shipment.cargo
        .filter((item) => item.unloadingAddress?.postalCodeId === addressId)
        .map((item) => toFormCargo(item, ref)),
    };
  }

  return { options, resolve };
}
