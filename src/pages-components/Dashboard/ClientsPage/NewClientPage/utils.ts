import { type CompanyFormInitialValues, getInitialCompanyFormValues, getPostalCodeOption } from '@/components/vies';
import type { Client } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';

import { formDefaultValues } from './const';
import type { ClientFormData } from './schema';

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

export const getInitialFormDefaultValues = (initialValues: CompanyFormInitialValues) => {
  return getInitialCompanyFormValues(initialValues) as unknown as ClientFormData;
};
