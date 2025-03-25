import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useCallback } from 'react';

import { type PostalCode, searchPostalCodes } from '@/lib/api';
import { FormAsyncSelect, type FormAsyncSelectProps } from '@/lib/components/form';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';

function mapPostalCodes(postalCodes: PostalCode[]) {
  return postalCodes.map((p) => {
    let label: string = p.postalCode;

    if (p.placeName) label += `, ${p.placeName}`;
    if (getCountryFromCode(p.countryCode).name) label += `, ${getCountryFromCode(p.countryCode).name}`;

    return { value: p.id, label };
  });
}

const promisedOptions = async (inputValue: string, countryCode: string) => {
  if (!countryCode) return [];

  const res = await searchPostalCodes(inputValue, countryCode);
  return mapPostalCodes(res);
};

interface PostalCodeSelectFieldProps extends Omit<FormAsyncSelectProps, 'promisedOptions'> {
  countryCode: string;
}

export const PostalCodeSelectField: React.FC<PostalCodeSelectFieldProps> = ({ countryCode, ...rest }) => {
  const promisedOptionsDebounced = useCallback(
    AwesomeDebouncePromise((inputVal) => promisedOptions(inputVal, countryCode), 400),
    [countryCode]
  );

  return <FormAsyncSelect promisedOptions={promisedOptionsDebounced} {...rest} />;
};
