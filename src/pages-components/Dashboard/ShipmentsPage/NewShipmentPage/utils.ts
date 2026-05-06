import { type CreateShipmentData, type Shipment } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import type { Tenant } from '@/lib/api/tenant.d';
import { PalleteType } from '@/lib/utils/palletes';

import type { Cargo, CargoType, ShipmentFields } from './types.d';

export const defaultCargo: Cargo = {
  description: '',
  ldm: 0.4,
  metadata: {
    type: 'standard',
    palleteType: PalleteType.Euro,
    palleteAmount: 1,
    hasKolete: false,
  },
  loadingAddress: {
    streetName: '',
    countryCode: '',
    postalCodeId: {},
  },
  unloadingAddress: {
    streetName: '',
    countryCode: '',
    postalCodeId: {},
  },
  loadingCompanyName: '',
  unloadingCompanyName: '',
  loadingReadyDate: '',
  loadingDescription: '',
  loadingReference: '',
  unloadingDueDate: '',
  unloadingDescription: '',
  unloadingReference: '',
};

export const formDefaultValues: ShipmentFields = {
  cargoReference: '',
  externalOrderReference: '',
  transportContractorId: '',
  clientId: '',
  cargo: [defaultCargo],
};

// Fetch postal code data for an address
export const fetchPostalCodeData = async (postalCodeId: string) => {
  try {
    const postalCodeData = await getPostalCode(postalCodeId);
    return {
      value: postalCodeData.id,
      label: `${postalCodeData.postalCode}, ${postalCodeData.placeName}`,
    };
  } catch (error) {
    console.error('Error fetching postal code:', error);
    return {};
  }
};

// Map cargo items from a shipment to the format expected by the form
const mapCargoItems = async (cargoItems?: any[], isEdit = false): Promise<Cargo[]> => {
  if (!cargoItems?.length) return [defaultCargo];

  return Promise.all(
    cargoItems.map(async (c) => {
      const cargoType = (c.metadata?.type || 'standard') as CargoType;
      const palleteAmount = c.metadata?.palleteAmount || (cargoType === 'standard' ? 1 : undefined);

      // Initialize hasKolete to true if cargo is nonstandard and has palleteAmount > 0
      const hasKolete = cargoType === 'nonstandard' && palleteAmount && palleteAmount > 0;

      // Fetch postal code data for addresses
      const loadingPostalCode = c.loadingAddress?.postalCodeId
        ? await fetchPostalCodeData(c.loadingAddress.postalCodeId)
        : {};
      const unloadingPostalCode = c.unloadingAddress?.postalCodeId
        ? await fetchPostalCodeData(c.unloadingAddress.postalCodeId)
        : {};

      return {
        ...(isEdit ? { id: c.id } : {}),
        weight: c.weight !== undefined && c.weight !== null ? c.weight : undefined,
        description: c.description || '',
        ldm: c.ldm || 0.4,
        metadata: {
          type: cargoType,
          palleteType: c.metadata?.palleteType || (cargoType === 'standard' ? PalleteType.Euro : undefined),
          palleteAmount,
          width: c.metadata?.width ?? undefined,
          height: c.metadata?.height ?? undefined,
          length: c.metadata?.length ?? undefined,
          hasKolete,
        },
        loadingAddress: {
          streetName: c.loadingAddress?.streetName || '',
          countryCode: c.loadingAddress?.countryCode,
          postalCodeId: loadingPostalCode,
        },
        unloadingAddress: {
          streetName: c.unloadingAddress?.streetName || '',
          countryCode: c.unloadingAddress?.countryCode,
          postalCodeId: unloadingPostalCode,
        },
        loadingCompanyName: c.loadingCompanyName || '',
        unloadingCompanyName: c.unloadingCompanyName || '',
        loadingReadyDate: c.loadingReadyDate || '',
        loadingDescription: c.loadingDescription || '',
        loadingReference: c.loadingReference || '',
        unloadingDueDate: c.unloadingDueDate || '',
        unloadingDescription: c.unloadingDescription || '',
        unloadingReference: c.unloadingReference || '',
      };
    })
  );
};

// Create form values for a new shipment
const getNewShipmentFormValues = async (tenant: Tenant, cargo: Cargo[]) => {
  return {
    ...formDefaultValues,
    transportContractorId: tenant.id,
    clientId: '',
    cargo,
  };
};

// Create form values when copying a shipment
const getCopyShipmentFormValues = async (shipment: Shipment) => {
  const cargo = await mapCargoItems(shipment.cargo);

  return {
    cargoReference: shipment.cargoReference || '',
    externalOrderReference: shipment.externalOrderReference || '',
    transportContractorId: shipment.transportContractorId || '',
    clientId: shipment.clientId || '',
    price: shipment.price !== undefined && shipment.price !== null ? shipment.price : undefined,
    cargo,
  };
};

// Create form values for editing an existing shipment
const getEditShipmentFormValues = async (shipment: Shipment) => {
  const cargo = await mapCargoItems(shipment.cargo, true);

  return {
    cargoReference: shipment.cargoReference || '',
    externalOrderReference: shipment.externalOrderReference || '',
    transportContractorId: shipment.transportContractorId || '',
    clientId: shipment.clientId || '',
    price: shipment.price !== undefined && shipment.price !== null ? shipment.price : undefined,
    cargo,
  };
};

// Main function to get form default values based on context
export const getFormDefaultValues = (shipment: Shipment | undefined, tenant: Tenant, isCopy: boolean = false) => {
  return async () => {
    // Case 1: Copy existing shipment
    if (shipment && isCopy) {
      return getCopyShipmentFormValues(shipment);
    }

    // Case 2: Edit existing shipment
    if (shipment && !isCopy) {
      return getEditShipmentFormValues(shipment);
    }

    // Case 3: Create a brand-new shipment
    return getNewShipmentFormValues(tenant, [defaultCargo]);
  };
};

// Function to transform form data into the format defined in types.ts
export const transformFormDataToPayload = (formData: ShipmentFields): Omit<CreateShipmentData, 'id'> => {
  const { cargoReference, externalOrderReference, clientId, transportContractorId, price, cargo } = formData;

  const payload: Partial<Omit<CreateShipmentData, 'id'>> = {};

  // Only add shipment-level fields that are present in formData
  if ('cargoReference' in formData) payload.cargoReference = cargoReference || '';
  if ('externalOrderReference' in formData) payload.externalOrderReference = externalOrderReference || '';
  if ('clientId' in formData) payload.clientId = clientId;
  if ('transportContractorId' in formData) payload.transportContractorId = transportContractorId;
  if ('price' in formData) payload.price = price || 0;

  // Handle cargo with addresses
  if (cargo) {
    payload.cargo = cargo.map((item) => {
      const result: any = {
        weight: item.weight || 0,
        ldm: item.ldm,
      };

      // Add cargo id (in case of edit)
      if ('id' in item) {
        result.id = item.id;
      }

      // Add description if present
      if ('description' in item) {
        result.description = item.description || '';
      }

      // Add loading address
      if (item.loadingAddress?.streetName && item.loadingAddress?.postalCodeId?.value) {
        result.loadingAddress = {
          streetName: item.loadingAddress.streetName,
          postalCodeId: item.loadingAddress.postalCodeId.value,
        };
      }

      // Add unloading address
      if (item.unloadingAddress?.streetName && item.unloadingAddress?.postalCodeId?.value) {
        result.unloadingAddress = {
          streetName: item.unloadingAddress.streetName,
          postalCodeId: item.unloadingAddress.postalCodeId.value,
        };
      }

      // Add company names
      if ('loadingCompanyName' in item) result.loadingCompanyName = item.loadingCompanyName || '';
      if ('unloadingCompanyName' in item) result.unloadingCompanyName = item.unloadingCompanyName || '';

      // Add dates
      if ('loadingReadyDate' in item) result.loadingReadyDate = item.loadingReadyDate || '';
      if ('unloadingDueDate' in item) result.unloadingDueDate = item.unloadingDueDate || '';

      // Add descriptions
      if ('loadingDescription' in item) result.loadingDescription = item.loadingDescription || '';
      if ('unloadingDescription' in item) result.unloadingDescription = item.unloadingDescription || '';

      // Add loading references
      if ('loadingReference' in item) result.loadingReference = item.loadingReference || '';
      if ('unloadingReference' in item) result.unloadingReference = item.unloadingReference || '';

      // Add metadata
      if (item.metadata) {
        const { type } = item.metadata;
        if (type === 'standard') {
          result.metadata = {
            type,
            ...(item.metadata.palleteType && { palleteType: item.metadata.palleteType }),
            ...(item.metadata.palleteAmount && { palleteAmount: item.metadata.palleteAmount }),
          };
        } else if (type === 'nonstandard') {
          result.metadata = {
            type,
            ...(item.metadata.width && { width: item.metadata.width }),
            ...(item.metadata.height && { height: item.metadata.height }),
            ...(item.metadata.length && { length: item.metadata.length }),
            ...(item.metadata.palleteAmount && { palleteAmount: item.metadata.palleteAmount }),
          };
        }
      }

      return result;
    });
  }

  return payload as Omit<CreateShipmentData, 'id'>;
};
