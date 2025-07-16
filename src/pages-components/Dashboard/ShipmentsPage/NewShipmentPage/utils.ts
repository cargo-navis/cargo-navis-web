import { type CreateShipmentData, getOrderNumber, getShipment, type Shipment } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import type { Tenant } from '@/lib/api/tenant.d';
import { PalleteType } from '@/lib/utils/palletes';

import type { Cargo, CargoType, ShipmentFields } from './types.d';

export const defaultCargo: Cargo = {
  weight: 0,
  description: '',
  ldm: 0.4,
  metadata: {
    type: 'standard',
    palleteType: PalleteType.Euro,
    palleteAmount: 1,
    hasKolete: false,
  },
};

export const formDefaultValues: ShipmentFields = {
  orderNumber: '',
  cargoReference: '',
  transportContractorId: '',
  clientId: '',
  isAgencyUse: false,
  price: 0,
  driverId: '',
  vehicleId: '',
  dispatcherId: '',
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
  loadingDate: '',
  loadingDescription: '',
  unloadingDate: '',
  unloadingDueDate: '',
  unloadingDescription: '',
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
const mapCargoItems = (cargoItems?: any[]): Cargo[] => {
  if (!cargoItems?.length) return [defaultCargo];

  return cargoItems.map((c) => {
    const cargoType = (c.metadata?.type || 'standard') as CargoType;
    const palleteAmount = c.metadata?.palleteAmount || (cargoType === 'standard' ? 1 : undefined);

    // Initialize hasKolete to true if cargo is nonstandard and has palleteAmount > 0
    const hasKolete = cargoType === 'nonstandard' && palleteAmount && palleteAmount > 0;

    return {
      weight: c.weight || 0,
      description: c.description || '',
      ldm: c.ldm || 0.4,
      metadata: {
        type: cargoType,
        palleteType: c.metadata?.palleteType || (cargoType === 'standard' ? PalleteType.Euro : undefined),
        palleteAmount,
        width: c.metadata?.width || 0,
        height: c.metadata?.height || 0,
        length: c.metadata?.length || 0,
        hasKolete,
      },
    };
  });
};

// Get cargo items from parent shipment
const getParentShipmentCargo = async (parentShipmentId: string): Promise<Cargo[]> => {
  try {
    const parentShipment = await getShipment(parentShipmentId);
    return mapCargoItems(parentShipment.cargo);
  } catch (error) {
    console.error('Error fetching parent shipment cargo:', error);
    return [defaultCargo];
  }
};

// Create form values for a new shipment
const getNewShipmentFormValues = async (tenant: Tenant, cargo: Cargo[]) => {
  const orderNumber = await getOrderNumber();

  return {
    ...formDefaultValues,
    orderNumber,
    transportContractorId: tenant.id,
    clientId: '',
    cargo,
  };
};

// Create form values for a new sub-shipment
const getNewSubShipmentFormValues = async (tenant: Tenant, parentShipmentId: string) => {
  const orderNumber = await getOrderNumber();
  const cargo = await getParentShipmentCargo(parentShipmentId);

  return {
    ...formDefaultValues,
    orderNumber,
    transportContractorId: tenant.id,
    clientId: tenant.id,
    cargo,
  };
};

// Create form values when copying a shipment
const getCopyShipmentFormValues = async (shipment: Shipment) => {
  const orderNumber = await getOrderNumber();

  // Fetch postal code data if needed
  const loadingPostalCode = shipment.loadingAddress?.id ? await fetchPostalCodeData(shipment.loadingAddress.id) : {};

  const unloadingPostalCode = shipment.unloadingAddress?.id
    ? await fetchPostalCodeData(shipment.unloadingAddress.id)
    : {};

  return {
    orderNumber, // Use new orderNumber
    cargoReference: shipment.cargoReference || '',
    transportContractorId: shipment.transportContractorId || '',
    clientId: shipment.clientId || '',
    price: shipment.price || 0,
    driverId: shipment.driverId || '',
    vehicleId: shipment.vehicleId || '',
    dispatcherId: shipment.dispatcherId || '',
    isAgencyUse: shipment.isAgencyUse || false,
    loadingAddress: {
      streetName: shipment.loadingAddress?.streetName || '',
      countryCode: shipment.loadingAddress?.countryCode,
      postalCodeId: loadingPostalCode,
    },
    unloadingAddress: {
      streetName: shipment.unloadingAddress?.streetName || '',
      countryCode: shipment.unloadingAddress?.countryCode,
      postalCodeId: unloadingPostalCode,
    },
    loadingCompanyName: shipment.loadingCompanyName || '',
    unloadingCompanyName: shipment.unloadingCompanyName || '',
    loadingReadyDate: shipment.loadingReadyDate || '',
    loadingDate: shipment.loadingDate || '',
    loadingDescription: shipment.loadingDescription || '',
    unloadingDate: shipment.unloadingDate || '',
    unloadingDueDate: shipment.unloadingDueDate || '',
    unloadingDescription: shipment.unloadingDescription || '',
    cargo: mapCargoItems(shipment.cargo),
  };
};

// Create form values for editing an existing shipment
const getEditShipmentFormValues = async (shipment: Shipment) => {
  // Fetch postal code data if needed
  const loadingPostalCode = shipment.loadingAddress?.id ? await fetchPostalCodeData(shipment.loadingAddress.id) : {};

  const unloadingPostalCode = shipment.unloadingAddress?.id
    ? await fetchPostalCodeData(shipment.unloadingAddress.id)
    : {};

  return {
    orderNumber: shipment.orderNumber || '',
    cargoReference: shipment.cargoReference || '',
    transportContractorId: shipment.transportContractorId || '',
    clientId: shipment.clientId || '',
    price: shipment.price || 0,
    driverId: shipment.driverId || '',
    vehicleId: shipment.vehicleId || '',
    dispatcherId: shipment.dispatcherId || '',
    isAgencyUse: shipment.isAgencyUse || false,
    loadingAddress: {
      streetName: shipment.loadingAddress?.streetName || '',
      countryCode: shipment.loadingAddress?.countryCode,
      postalCodeId: loadingPostalCode,
    },
    unloadingAddress: {
      streetName: shipment.unloadingAddress?.streetName || '',
      countryCode: shipment.unloadingAddress?.countryCode,
      postalCodeId: unloadingPostalCode,
    },
    loadingCompanyName: shipment.loadingCompanyName || '',
    unloadingCompanyName: shipment.unloadingCompanyName || '',
    loadingReadyDate: shipment.loadingReadyDate || '',
    loadingDate: shipment.loadingDate || '',
    loadingDescription: shipment.loadingDescription || '',
    unloadingDate: shipment.unloadingDate || '',
    unloadingDueDate: shipment.unloadingDueDate || '',
    unloadingDescription: shipment.unloadingDescription || '',
    cargo: mapCargoItems(shipment.cargo),
  };
};

// Main function to get form default values based on context
export const getFormDefaultValues = (
  shipment: Shipment | undefined,
  tenant: Tenant,
  parentShipmentId?: string,
  isCopy: boolean = false
) => {
  return async () => {
    // Case 1: Copy existing shipment
    if (shipment && isCopy) {
      return getCopyShipmentFormValues(shipment);
    }

    // Case 2: Edit existing shipment
    if (shipment && !isCopy) {
      return getEditShipmentFormValues(shipment);
    }

    // Case 3: Create a sub-shipment
    if (parentShipmentId) {
      return getNewSubShipmentFormValues(tenant, parentShipmentId);
    }

    // Case 4: Create a brand new shipment
    return getNewShipmentFormValues(tenant, [defaultCargo]);
  };
};

// Function to transform form data into the format defined in types.ts
export const transformFormDataToPayload = (formData: ShipmentFields): Omit<CreateShipmentData, 'id'> => {
  const {
    cargoReference,
    orderNumber,
    dispatcherId,
    driverId,
    vehicleId,
    trailerId,
    clientId,
    isAgencyUse,
    transportContractorId,
    price,
    loadingAddress,
    unloadingAddress,
    loadingCompanyName,
    unloadingCompanyName,
    loadingReadyDate,
    loadingDate,
    loadingDescription,
    unloadingDate,
    unloadingDueDate,
    unloadingDescription,
    cargo,
  } = formData;

  const payload: Partial<Omit<CreateShipmentData, 'id'>> = {};

  // Only add fields that are present in formData
  if ('cargoReference' in formData) payload.cargoReference = cargoReference || '';
  if ('orderNumber' in formData) payload.orderNumber = orderNumber;
  if ('dispatcherId' in formData) payload.dispatcherId = dispatcherId;
  if ('driverId' in formData) payload.driverId = driverId;
  if ('vehicleId' in formData) payload.vehicleId = vehicleId;
  if ('trailerId' in formData) payload.trailerId = trailerId;
  if ('clientId' in formData) payload.clientId = clientId;
  if ('isAgencyUse' in formData) payload.isAgencyUse = isAgencyUse;
  if ('transportContractorId' in formData) payload.transportContractorId = transportContractorId;
  if ('price' in formData) payload.price = price || 0;

  // Handle addresses only if they exist in formData
  if (loadingAddress?.streetName && loadingAddress?.postalCodeId?.value) {
    payload.loadingAddress = {
      streetName: loadingAddress.streetName || '',
      postalCodeId: loadingAddress.postalCodeId?.value || '',
    };
  }

  if (unloadingAddress?.streetName && unloadingAddress?.postalCodeId?.value) {
    payload.unloadingAddress = {
      streetName: unloadingAddress.streetName || '',
      postalCodeId: unloadingAddress.postalCodeId?.value || '',
    };
  }

  // Handle company names
  if ('loadingCompanyName' in formData) payload.loadingCompanyName = loadingCompanyName || '';
  if ('unloadingCompanyName' in formData) payload.unloadingCompanyName = unloadingCompanyName || '';

  // Handle dates and descriptions only if they exist in formData
  if ('loadingReadyDate' in formData) payload.loadingReadyDate = loadingReadyDate || '';
  if ('loadingDate' in formData) payload.loadingDate = loadingDate || '';
  if ('loadingDescription' in formData) payload.loadingDescription = loadingDescription || '';
  if ('unloadingDate' in formData) payload.unloadingDate = unloadingDate || '';
  if ('unloadingDueDate' in formData) payload.unloadingDueDate = unloadingDueDate || '';
  if ('unloadingDescription' in formData) payload.unloadingDescription = unloadingDescription || '';

  // Handle cargo only if it exists in formData
  if (cargo) {
    payload.cargo = cargo.map((item) => {
      const result: any = {
        weight: item.weight || 0,
        ldm: item.ldm,
      };

      if ('description' in item) {
        result.description = item.description || '';
      }

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
