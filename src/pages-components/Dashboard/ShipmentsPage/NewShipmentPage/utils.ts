import { type CompanyFormInitialValues, getCompanyFormInitialValuesFromVies } from '@/components/vies';
import { type CreateAgencyShipmentData, type CreateShipmentData, type ShipmentDraft } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import type { SuggestedNewClient } from '@/lib/api/shipment-drafts.d';
import { parseTaxId } from '@/lib/utils/vies';

import type { ShipmentFields } from './types.d';

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

// Function to transform form data into the format defined in types.ts
export const transformFormDataToPayload = (
  formData: ShipmentFields,
  context?: { draftId?: string }
): Omit<CreateShipmentData, 'id'> => {
  const { externalOrderReference, clientId, transportContractorId, price, internalNote, externalNote, cargo } =
    formData;

  const payload: Partial<Omit<CreateShipmentData, 'id'>> = {};

  // Only add shipment-level fields that are present in formData. We use `??`
  // rather than `||` for numerics so a legitimate 0 isn't swallowed; the
  // FieldState-style BE patch treats absent fields as untouched.
  if ('externalOrderReference' in formData) payload.externalOrderReference = externalOrderReference ?? '';
  if ('clientId' in formData) payload.clientId = clientId;
  if ('transportContractorId' in formData) payload.transportContractorId = transportContractorId;
  if ('price' in formData && price !== undefined) payload.price = price;
  if ('internalNote' in formData) payload.internalNote = internalNote ?? '';
  if ('externalNote' in formData) payload.externalNote = externalNote ?? '';
  if ('notificationEmails' in formData) payload.notificationEmails = formData.notificationEmails ?? [];

  // Handle cargo with addresses
  if (cargo) {
    payload.cargo = cargo.map((item) => {
      const result: any = {
        weight: item.weight ?? 0,
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

  // draftId lands on the parent only — the backend links the confirmed
  // shipment back to its draft. Setting it after the agency split keeps
  // it off the child payload that would otherwise inherit it via spread.
  if (context?.draftId) {
    payload.draftId = context.draftId;
  }

  return payload as Omit<CreateShipmentData, 'id'>;
};

// The agency endpoints take a single flat payload: unprefixed fields describe
// the incoming order from the client, `contractor*` ones the outgoing order to
// the carrier. `transportContractorId` is that carrier — no parent/child
// splitting happens on the client anymore.
export const transformFormDataToAgencyPayload = (
  formData: ShipmentFields,
  context?: { draftId?: string }
): CreateAgencyShipmentData => {
  const { clientId, transportContractorId, agencyPrice } = formData;

  return {
    ...transformFormDataToPayload(formData, context),
    clientId,
    transportContractorId,
    contractorPrice: agencyPrice,
  } as CreateAgencyShipmentData;
};

export const getSuggestedNewClient = (draft?: ShipmentDraft): SuggestedNewClient | undefined => {
  return draft?.suggestedNewClient ?? draft?.aiExtractedData?.suggestedNewClient ?? undefined;
};

export const getSuggestedClientFormValues = (suggestedClient: SuggestedNewClient): CompanyFormInitialValues => {
  return getCompanyFormInitialValuesFromVies(suggestedClient, parseTaxId(suggestedClient.taxId).countryCode);
};
