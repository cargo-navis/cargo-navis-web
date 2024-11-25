import { CheckboxGroupWithLabels, type CheckboxGroupWithLabelsProps } from '@/ui/hocs';
import { type UseControllerProps, useController } from 'react-hook-form';

interface FormCheckboxGroupProps extends Omit<CheckboxGroupWithLabelsProps, 'values' | 'onChange'> {
  name: string;
  initialValue?: string[];
  rules?: UseControllerProps['rules'];
}

export const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({
  name,
  initialValue,
  rules,
  isDisabled,
  ...rest
}) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  return (
    <CheckboxGroupWithLabels
      name={name}
      {...rest}
      isDisabled={isDisabled && isSubmitting}
      values={value || []}
      onChange={onChange}
    />
  );
};
