import { type PostalCode, searchPostalCodes } from '@/lib/api';
import { FormAsyncSelect, type FormAsyncSelectProps } from '@/lib/components/form';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

function mapPostalCodes(postalCodes: PostalCode[]) {
  return postalCodes.map((p) => ({
    value: p.id,
    label: `${p.postalCode}, ${p.city || p.region}, ${getCountryFromCode(p.countryCode).name}`,
  }));
}

const promisedOptions = async (inputValue: string) => {
  if (inputValue?.length < 3) {
    return [];
  }

  const res = await searchPostalCodes(inputValue);
  return mapPostalCodes(res);
};

const promisedOptionsDebounced = AwesomeDebouncePromise(promisedOptions, 400);

type PostalCodeSelectFieldProps = Omit<FormAsyncSelectProps, 'promisedOptions'>;

export const PostalCodeSelectField: React.FC<PostalCodeSelectFieldProps> = (props) => {
  return (
    <FormAsyncSelect
      promisedOptions={promisedOptionsDebounced}
      {...props}
    />
  );
};
