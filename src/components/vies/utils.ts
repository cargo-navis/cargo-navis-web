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

/** The subset of a VIES company any caller can hand over, including a draft's suggested client. */
export interface ViesCompanyLike {
  taxId: string;
  name?: string | null;
  address?: {
    countryCode?: string;
    placeName?: string;
    postalCode?: string;
    postalCodeId?: string;
    streetName?: string;
  } | null;
}

/**
 * Maps whatever VIES returned onto the company form. Every field is guarded on
 * its own, VIES may confirm the tax id and withhold any subset of the details.
 * `fallbackCountryCode` covers the case where there is no postal code to read
 * the country from, e.g. the country of the searched tax id.
 */
export function getCompanyFormInitialValuesFromVies(
  company: ViesCompanyLike,
  fallbackCountryCode?: string
): CompanyFormInitialValues {
  const { taxId, name, address } = company;

  return {
    name: name ?? undefined,
    taxId,
    addressName: address?.streetName,
    countryCode: fallbackCountryCode,
    postalCode: address?.postalCodeId
      ? {
          id: address.postalCodeId,
          postalCode: address.postalCode ?? '',
          placeName: address.placeName ?? '',
          countryCode: address.countryCode ?? fallbackCountryCode ?? '',
        }
      : undefined,
  };
}
