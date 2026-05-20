import type { Client } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';

import { formDefaultValues } from './const';

export const getFormDefaultValues = (client: Client | undefined) => {
  if (!client) return formDefaultValues;

  return async () => {
    const postalCodeData = await getPostalCode(client.address.postalCodeId);

    return {
      ...client,
      addressName: client.address?.streetName,
      countryCode: client.address?.countryCode,
      addressPostalCode: {
        value: postalCodeData.id,
        label: `${postalCodeData.postalCode}, ${postalCodeData.placeName}, ${getCountryFromCode(postalCodeData.countryCode).name}`,
      },
    };
  };
};
