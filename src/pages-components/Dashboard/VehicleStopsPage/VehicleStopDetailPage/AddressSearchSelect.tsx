import type { Cargo, LoadingAddress } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { SingleSelectWithLabels } from '@/ui/hocs';

import { parseAddressKey } from './addressHelpers';
import { useAddressOptions } from './useAddressOptions';

export interface SelectedAddress {
  shipmentId: string;
  address: LoadingAddress;
  loadingCargos: Cargo[];
  unloadingCargos: Cargo[];
}

interface AddressSearchSelectProps {
  value: string;
  onChange(selected: SelectedAddress | null): void;
  stop?: VehicleStop;
  label?: string;
  placeholder?: string;
}

export const AddressSearchSelect = ({
  value,
  onChange,
  stop,
  label = 'Adresa',
  placeholder = 'Pretraži po adresi, klijentu ili broju naloga',
}: AddressSearchSelectProps) => {
  const { shipments, addressOptions, filterAddressOption } = useAddressOptions(stop);

  function handleChange(key: string | undefined) {
    if (!key) return onChange(null);

    const { shipmentId, addressId } = parseAddressKey(key);
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (!shipment) return onChange(null);

    const cargo = shipment.cargo.find(
      (c) => c.loadingAddress?.id === addressId || c.unloadingAddress?.id === addressId
    );
    const address = cargo?.loadingAddress?.id === addressId ? cargo?.loadingAddress : cargo?.unloadingAddress;
    if (!address) return onChange(null);

    onChange({
      shipmentId,
      address,
      loadingCargos: shipment.cargo.filter((c) => c.loadingAddress?.id === addressId),
      unloadingCargos: shipment.cargo.filter((c) => c.unloadingAddress?.id === addressId),
    });
  }

  return (
    <SingleSelectWithLabels
      filterOption={filterAddressOption}
      isClearable
      isSearchable
      label={label}
      options={addressOptions}
      placeholder={placeholder}
      value={value}
      onChange={(v) => handleChange(v ? String(v) : undefined)}
    />
  );
};
