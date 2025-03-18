import { type CreateShipmentData, getOrderNumber, type Shipment } from '@/lib/api';
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

export const getFormDefaultValues = (shipment: Shipment | undefined, tenant: Tenant) => {
  return async () => {
    if (!shipment) {
      const orderNumber = await getOrderNumber();
      return { ...formDefaultValues, orderNumber, transportContractorId: tenant.id };
    }

    // Fetch postal code data if needed
    let loadingPostalCode = {};
    let unloadingPostalCode = {};

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
              width: c.metadata?.width || 0,
              height: c.metadata?.height || 0,
              length: c.metadata?.length || 0,
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

  const payload: Partial<Omit<CreateShipmentData, 'id'>> = {};

  // Only add fields that are present in formData
  if ('cargoReference' in formData) payload.cargoReference = cargoReference || '';
  if ('orderNumber' in formData) payload.orderNumber = orderNumber;
  if ('dispatcherId' in formData) payload.dispatcherId = dispatcherId;
  if ('driverId' in formData) payload.driverId = driverId;
  if ('vehicleId' in formData) payload.vehicleId = vehicleId;
  if ('clientId' in formData) payload.clientId = clientId;
  if ('transportContractorId' in formData) payload.transportContractorId = transportContractorId;
  if ('price' in formData) payload.price = price || 0;

  // Handle addresses only if they exist in formData
  if (loadingAddress) {
    payload.loadingAddress = {
      name: loadingAddress.name || '',
      postalCodeId: loadingAddress.postalCodeId?.value || '',
    };
  }

  if (unloadingAddress) {
    payload.unloadingAddress = {
      name: unloadingAddress.name || '',
      postalCodeId: unloadingAddress.postalCodeId?.value || '',
    };
  }

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
          };
        }
      }

      return result;
    });
  }

  return payload as Omit<CreateShipmentData, 'id'>;
};
