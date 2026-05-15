import { getDataPointDateString } from '@/lib/utils/date';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';

import type { ShipmentFields } from '../types';

export function getOptionLabels(
  address: ShipmentFields['cargo'][0]['loadingAddress'],
  date: string,
  companyName?: string
) {
  const formattedDate = getDataPointDateString(date);

  const labelParts = [formattedDate];
  if (address.postalCodeId?.label) {
    labelParts.push(`(${address.postalCodeId.label})`);
  }

  const label = labelParts.join(' ');

  const helperParts: string[] = [];
  if (address.streetName) {
    helperParts.push(address.streetName);
  }

  if (address.postalCodeId?.label) {
    helperParts.push(address.postalCodeId.label);
  }

  if (address.countryCode) {
    const country = getCountryFromCode(address.countryCode);
    if (country?.name) {
      helperParts.push(country.name);
    }
  }

  if (companyName) {
    helperParts.push(`(${companyName})`);
  }

  const helper = helperParts.join(', ');

  return { label, helper };
}
