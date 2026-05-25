import type { Contractor } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';

import { formDefaultValues } from './const';

export const getFormDefaultValues = (contractor: Contractor | undefined) => {
  if (!contractor) return formDefaultValues;

  return async () => {
    const postalCodeData = await getPostalCode(contractor.address.postalCodeId);

    return {
      ...contractor,
      addressName: contractor.address?.streetName,
      countryCode: contractor.address?.countryCode,
      addressPostalCode: {
        value: postalCodeData.id,
        label: `${postalCodeData.postalCode}, ${postalCodeData.placeName}, ${getCountryFromCode(postalCodeData.countryCode).name}`,
      },
    };
  };
};
