import type { Client } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import type { PostalCode } from '@/lib/api/postalCodes.d';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';

import { formDefaultValues } from './const';
import type { ClientFormData } from './schema';

/** Values a new client form can start from, e.g. what the VIES lookup returned. */
export interface ClientFormInitialValues {
  name?: string;
  taxId?: string;
  addressName?: string;
  countryCode?: string;
  postalCode?: PostalCode;
}

function getPostalCodeOption(postalCode: PostalCode) {
  return {
    value: postalCode.id,
    label: `${postalCode.postalCode}, ${postalCode.placeName}, ${getCountryFromCode(postalCode.countryCode).name}`,
  };
}

export const getFormDefaultValues = (client: Client | undefined) => {
  if (!client) return formDefaultValues;

  return async () => {
    const postalCodeData = await getPostalCode(client.address.postalCodeId);

    return {
      ...client,
      email: client.email ?? '',
      addressName: client.address?.streetName,
      countryCode: client.address?.countryCode,
      addressPostalCode: getPostalCodeOption(postalCodeData),
    };
  };
};

export const getInitialFormDefaultValues = (initialValues: ClientFormInitialValues) => {
  return {
    ...formDefaultValues,
    name: initialValues.name ?? '',
    taxId: initialValues.taxId ?? '',
    addressName: initialValues.addressName ?? '',
    countryCode: initialValues.postalCode?.countryCode ?? initialValues.countryCode ?? '',
    addressPostalCode: initialValues.postalCode ? getPostalCodeOption(initialValues.postalCode) : undefined,
  } as unknown as ClientFormData;
};
