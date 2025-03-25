import { useController, type UseControllerProps } from 'react-hook-form';

import { TextareaWithLabels, type TextareaWithLabelsProps } from '@/ui/hocs';

interface FormTextareaProps extends Omit<TextareaWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  initialValue?: string;
  isErrorHidden?: boolean;
  rules?: UseControllerProps['rules'];
}

export const FormTextarea: React.FC<FormTextareaProps> = (props) => {
  const { name, initialValue, isErrorHidden = false, rules, ...rest } = props;
  const {
    field: { value, onChange, onBlur },
    fieldState: { isTouched, isDirty, error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  const initialErrorMessage = initialValue && error?.message;
  const dirtyErrorMessage = (isTouched && isDirty && !isErrorHidden && error?.message) as string;

  return (
    <TextareaWithLabels
      {...rest}
      errorText={initialErrorMessage || dirtyErrorMessage}
      isDisabled={isSubmitting}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};
