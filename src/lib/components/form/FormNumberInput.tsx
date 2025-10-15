import { useController, type UseControllerProps } from 'react-hook-form';

import { NumberInputWithLabels, type NumberInputWithLabelsProps } from '@/ui/hocs';

export interface FormNumberInputProps extends Omit<NumberInputWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
}

export const FormNumberInput: React.FC<FormNumberInputProps> = ({ name, initialValue, rules, ...rest }) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  const isRequired = !!rules?.required;

  return (
    <NumberInputWithLabels
      errorText={error?.message}
      isDisabled={isSubmitting}
      isRequired={isRequired}
      name={name}
      {...rest}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};
