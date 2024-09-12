import { type UseControllerProps, useController } from 'react-hook-form';

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

  return (
    <TextInputWithLabels
      name={name}
      errorText={error?.message}
      {...rest}
      isDisabled={isSubmitting}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};
