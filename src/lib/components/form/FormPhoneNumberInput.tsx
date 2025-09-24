import { useController, UseControllerProps } from 'react-hook-form';

import { withFieldLabels } from '@/ui/hocs';

import { PhoneNumberInput, type PhoneNumberInputProps, PhoneNumberValue } from '../PhoneNumberInput';

const PhoneNumberInputWithLabels = withFieldLabels(PhoneNumberInput);

export interface FormPhoneNumberInputProps extends Omit<PhoneNumberInputProps, 'value' | 'onChange'> {
  name: string;
  initialValue?: PhoneNumberValue;
  rules?: UseControllerProps['rules'];
  label: string;
}

export const FormPhoneNumberInput: React.FC<FormPhoneNumberInputProps> = (props) => {
  const { name, initialValue, rules, label, ...rest } = props;
  const {
    field: { value, onChange },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  return (
    <PhoneNumberInputWithLabels
      errorText={error?.message}
      isDisabled={isSubmitting}
      label={label}
      {...rest}
      value={value}
      onChange={onChange}
    />
  );
};
