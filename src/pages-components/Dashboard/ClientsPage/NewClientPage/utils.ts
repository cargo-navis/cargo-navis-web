import type { Client } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';

import { formDefaultValues } from './const';

export const getFormDefaultValues = (client: Client | undefined) => {
  if (!client) return formDefaultValues;

  return async () => {
    const postalCodeData = await getPostalCode(client.address.id);

    return {
      ...client,
      addressName: client.address?.streetName,
      countryCode: client.address?.countryCode,
      addressPostalCode: {
        value: postalCodeData.id,
        //label: postalCodeData.postalCode,
        label: `${postalCodeData.postalCode}, ${postalCodeData.city}, ${postalCodeData.region}, ${getCountryFromCode(postalCodeData.countryCode).name}`,
      },
    };
  };
};
