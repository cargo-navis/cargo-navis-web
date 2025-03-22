import { useController, type UseControllerProps } from 'react-hook-form';

import { TextInputWithLabels, type TextInputWithLabelsProps } from '@/ui/hocs';

export interface FormTextInputProps extends Omit<TextInputWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
}

export const FormTextInput: React.FC<FormTextInputProps> = ({ name, initialValue, rules, ...rest }) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  const isRequired = !!rules?.required;

  return (
    <TextInputWithLabels
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
