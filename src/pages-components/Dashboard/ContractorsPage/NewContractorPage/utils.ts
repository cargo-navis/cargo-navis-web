import { type CompanyFormInitialValues, getInitialCompanyFormValues, getPostalCodeOption } from '@/components/vies';
import type { Contractor } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';

import { formDefaultValues } from './const';
import type { ContractorFormData } from './schema';

export const getFormDefaultValues = (contractor: Contractor | undefined) => {
  if (!contractor) return formDefaultValues;

  return async () => {
    const postalCodeData = await getPostalCode(contractor.address.postalCodeId);

    return {
      ...contractor,
      email: contractor.email ?? '',
      addressName: contractor.address?.streetName,
      countryCode: contractor.address?.countryCode,
      addressPostalCode: getPostalCodeOption(postalCodeData),
    };
  };
};

export const getInitialFormDefaultValues = (initialValues: CompanyFormInitialValues) => {
  return getInitialCompanyFormValues(initialValues) as unknown as ContractorFormData;
};
