import type { PostalCode } from '@/lib/api/postalCodes.d';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';

import type { CompanyFormInitialValues } from './types';

/** The option shape the postal code select renders. */
export function getPostalCodeOption(postalCode: PostalCode) {
  return {
    value: postalCode.id,
    label: `${postalCode.postalCode}, ${postalCode.placeName}, ${getCountryFromCode(postalCode.countryCode).name}`,
  };
}

/**
 * Fills in whatever is known up front, everything else stays empty for the user.
 * The postal code is left unset when there is none, same as an empty form.
 */
export function getInitialCompanyFormValues(initialValues: CompanyFormInitialValues) {
  return {
    name: initialValues.name ?? '',
    taxId: initialValues.taxId ?? '',
    addressName: initialValues.addressName ?? '',
    countryCode: initialValues.postalCode?.countryCode ?? initialValues.countryCode ?? '',
    addressPostalCode: initialValues.postalCode ? getPostalCodeOption(initialValues.postalCode) : undefined,
    email: '',
  };
}
