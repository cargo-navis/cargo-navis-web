import { CheckboxGroup, CheckboxGroupProps } from '@/ui';
import { useController, UseControllerProps } from 'react-hook-form';

interface FormCheckboxGroupProps extends Omit<CheckboxGroupProps, 'value' | 'onChange'> {
  name: string;
  isDisabled?: boolean;
  initialValue?: string[];
  rules?: UseControllerProps['rules'];
}

export const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({ name, isDisabled, initialValue, rules, ...rest }) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });


  return (
    <CheckboxGroup isDisabled={isSubmitting} name={name} {...rest} values={value} onChange={onChange} />
  );
}