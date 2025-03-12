import type { CreateShipmentData, LoadingAddress } from '@/lib/api';

import type { ShipmentFields } from './types.d';

export enum PalleteType {
  Small = 'small',
  Euro = 'euro',
  Ship = 'ship',
  Industry = 'industry',
  Jumbo = 'jumbo',
}

// Function to transform form data into the format defined in types.ts
export const transformFormDataToPayload = (formData: ShipmentFields): CreateShipmentData => {
  const {
    cargoReference,
    orderNumber,
    dispatcherId,
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
    postalCodeId: loadingAddress?.postalCodeId?.value || '', // Assuming postalCodeId is an object
  };

  const transformedUnloadingAddress: LoadingAddress = {
    name: unloadingAddress?.name || '',
    postalCodeId: unloadingAddress?.postalCodeId?.value || '', // Assuming postalCodeId is an object
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
