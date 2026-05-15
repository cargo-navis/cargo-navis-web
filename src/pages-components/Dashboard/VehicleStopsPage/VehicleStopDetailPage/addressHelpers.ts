type AddressLike = {
  streetName?: string | null;
  postalCode?: string | null;
  placeName?: string | null;
};

export function buildAddressKey(shipmentId: string, addressId: string) {
  return `${shipmentId}:${addressId}`;
}

export function parseAddressKey(key: string) {
  const [shipmentId, addressId] = key.split(':');
  return { shipmentId, addressId };
}

export function formatAddressLabel(address: AddressLike) {
  const place = [address.postalCode, address.placeName].filter(Boolean).join(' ');
  return [address.streetName, place].filter(Boolean).join(', ');
}

export function formatPostalCodeLabel(address: AddressLike) {
  return [address.postalCode, address.placeName].filter(Boolean).join(', ');
}
