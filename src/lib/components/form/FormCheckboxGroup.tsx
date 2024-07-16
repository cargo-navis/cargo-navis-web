import { useController, UseControllerProps } from 'react-hook-form';
import { CheckboxGroupWithLabels, CheckboxGroupWithLabelsProps } from '@/ui/hocs';

interface FormCheckboxGroupProps extends Omit<CheckboxGroupWithLabelsProps, 'values' | 'onChange'> {
  name: string;
  initialValue?: string[];
  rules?: UseControllerProps['rules'];
}

export const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({ name, initialValue, rules, ...rest }) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  return (
    <CheckboxGroupWithLabels name={name} {...rest} isDisabled={isSubmitting} values={value || []} onChange={onChange} />
  );
}