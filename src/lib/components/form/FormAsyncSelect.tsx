import { type PostalCode, searchPostalCodes } from '@/lib/api';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { type UseControllerProps, useController } from 'react-hook-form';

import { AsyncSelectWithLabels, type AsyncSelectWithLabelsProps } from '@/ui/hocs';

function mapPostalCodes(postalCodes: PostalCode[]) {
  return postalCodes.map((p) => ({
    value: p.id,
    label: `${p.postalCode}, ${p.city || p.region}, ${getCountryFromCode(p.countryCode).name}`,
  }));
}

const promiseOptions = async (inputValue: string) => {
  if (inputValue?.length < 3) {
    return [];
  }

  const res = await searchPostalCodes(inputValue);
  return mapPostalCodes(res);
};

interface FormAsyncSelectProps extends Omit<AsyncSelectWithLabelsProps, 'value' | 'onChange' | 'loadOptions'> {
  name: string;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
  // promiseOptions: AsyncProps<any, false, any>['loadOptions'];
}

export const FormAsyncSelect: React.FC<FormAsyncSelectProps> = (props) => {
  const { name, initialValue, rules, isDisabled, ...rest } = props;
  const {
    field: { value, onChange, onBlur },
    fieldState: { isTouched, isDirty, error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  return (
    <AsyncSelectWithLabels
      name={name}
      {...rest}
      value={value}
      loadOptions={promiseOptions}
      errorText={(initialValue && error?.message) || ((isTouched && isDirty && error?.message) as string)}
      isDisabled={isSubmitting || isDisabled}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};
