import type { CreateShipmentData, LoadingAddress, Shipment } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import { PalleteType } from '@/lib/utils/pallete';

import type { Cargo, CargoType, ShipmentFields } from './types.d';

export const defaultCargo: Cargo = {
  weight: 0,
  description: '',
  ldm: 0.4,
  metadata: {
    type: 'standard',
    palleteType: PalleteType.Euro,
    palleteAmount: 1,
  },
};

export const formDefaultValues: ShipmentFields = {
  orderNumber: '2025/24', // TODO - generate incrementally
  cargoReference: '',
  transportContractorId: '',
  clientId: '',
  price: 0,
  driverId: '',
  vehicleId: '',
  dispatcherId: '',
  loadingAddress: {
    name: '',
    postalCodeId: {},
  },
  unloadingAddress: {
    name: '',
    postalCodeId: {},
  },
  loadingReadyDate: '',
  loadingDate: '',
  loadingDescription: '',
  unloadingDate: '',
  unloadingDueDate: '',
  unloadingDescription: '',
  cargo: [defaultCargo],
};

export const getFormDefaultValues = (shipment: Shipment | undefined) => {
  if (!shipment) return formDefaultValues;

  return async () => {
    // Fetch postal code data if needed
    let loadingPostalCode = {};
    let unloadingPostalCode = {};

    // TODO - remove when BE is fixed
    const loadingAddress = shipment.loadingAddressName;
    const unloadingAddress = shipment.unloadingAddressName;

    if (loadingAddress) {
      shipment.loadingAddress = loadingAddress;
    }

    if (unloadingAddress) {
      shipment.unloadingAddress = unloadingAddress;
    }
    // TODO ---

    if (shipment.loadingAddress?.id) {
      try {
        const postalCodeData = await getPostalCode(shipment.loadingAddress.id);
        loadingPostalCode = {
          value: postalCodeData.id,
          label: `${postalCodeData.postalCode}, ${postalCodeData.city}, ${postalCodeData.region}`,
        };
      } catch (error) {
        console.error('Error fetching loading postal code:', error);
      }
    }

    if (shipment.unloadingAddress?.id) {
      try {
        const postalCodeData = await getPostalCode(shipment.unloadingAddress.id);
        unloadingPostalCode = {
          value: postalCodeData.id,
          label: `${postalCodeData.postalCode}, ${postalCodeData.city}, ${postalCodeData.region}`,
        };
      } catch (error) {
        console.error('Error fetching unloading postal code:', error);
      }
    }

    return {
      orderNumber: shipment.orderNumber || '',
      cargoReference: shipment.cargoReference || '',
      transportContractorId: shipment.transportContractorId || '',
      clientId: shipment.clientId || '',
      price: shipment.price || 0,
      driverId: shipment.driverId || '',
      vehicleId: shipment.vehicleId || '',
      dispatcherId: shipment.dispatcherId || '',
      loadingAddress: {
        name: shipment.loadingAddress?.streetName || '',
        countryCode: shipment.loadingAddress?.countryCode,
        postalCodeId: loadingPostalCode,
      },
      unloadingAddress: {
        name: shipment.unloadingAddress?.streetName || '',
        countryCode: shipment.unloadingAddress?.countryCode,
        postalCodeId: unloadingPostalCode,
      },
      loadingReadyDate: shipment.loadingReadyDate || '',
      loadingDate: shipment.loadingDate || '',
      loadingDescription: shipment.loadingDescription || '',
      unloadingDate: shipment.unloadingDate || '',
      unloadingDueDate: shipment.unloadingDueDate || '',
      unloadingDescription: shipment.unloadingDescription || '',
      cargo: shipment.cargo?.length
        ? shipment.cargo.map((c) => ({
            weight: c.weight || 0,
            description: c.description || '',
            ldm: c.ldm || 0.4,
            metadata: {
              type: (c.metadata?.type || 'standard') as CargoType,
              palleteType: c.metadata?.palleteType || PalleteType.Euro,
              palleteAmount: c.metadata?.palleteAmount || 1,
            },
          }))
        : formDefaultValues.cargo,
    };
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
    clientId,
    transportContractorId,
    price,
    loadingAddress,
    unloadingAddress,
    loadingReadyDate,
    loadingDate,
    loadingDescription,
    unloadingDate,
    unloadingDueDate,
    unloadingDescription,
    cargo,
  } = formData;

  // Transform loadingAddress and unloadingAddress to match the expected format
  const transformedLoadingAddress: LoadingAddress = {
    name: loadingAddress?.name || '',
    postalCodeId: loadingAddress?.postalCodeId?.value || '',
  };

  const transformedUnloadingAddress: LoadingAddress = {
    name: unloadingAddress?.name || '',
    postalCodeId: unloadingAddress?.postalCodeId?.value || '',
  };

  // Transform cargo array with conditional logic for metadata
  const transformedCargo = cargo.map((item) => {
    const { type } = item.metadata; // Get the type from metadata
    let metadata;

    if (type === 'standard') {
      metadata = {
        type,
        palleteType: item.metadata.palleteType || '',
        palleteAmount: item.metadata.palleteAmount || 1, // Default to 1 if undefined
      };
    } else if (type === 'nonstandard') {
      metadata = {
        type,
        width: item.metadata.width || 0, // Default to 0 if undefined
        height: item.metadata.height || 0, // Default to 0 if undefined
        length: item.metadata.length || 0, // Default to 0 if undefined
      };
    }

    return {
      weight: item.weight || 0, // Default to 0 if undefined
      description: item.description || '',
      ldm: item.ldm,
      metadata,
    };
  });

  // Return the transformed payload
  return {
    cargoReference: cargoReference || '',
    orderNumber,
    dispatcherId,
    driverId,
    vehicleId,
    clientId,
    transportContractorId,
    price: price || 0, // Default to 0 if undefined
    cargo: transformedCargo,
    loadingAddress: transformedLoadingAddress,
    loadingReadyDate: loadingReadyDate || '',
    loadingDate: loadingDate || '',
    loadingDescription: loadingDescription || '',
    unloadingAddress: transformedUnloadingAddress,
    unloadingDate: unloadingDate || '',
    unloadingDueDate: unloadingDueDate || '',
    unloadingDescription: unloadingDescription || '',
    parentShipmentId: '', // Assuming this is not provided in the form
  };
};
