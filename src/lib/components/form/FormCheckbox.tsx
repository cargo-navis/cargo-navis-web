import { useController, type UseControllerProps } from 'react-hook-form';

import { Checkbox } from '@/ui';

interface FormCheckboxProps {
  name: string;
  label?: string;
  isDisabled?: boolean;
  rules?: UseControllerProps['rules'];
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({ name, label, isDisabled, rules }) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: false, rules });

  return (
    <Checkbox isDisabled={isDisabled || isSubmitting} label={label} name={name} value={!!value} onChange={onChange} />
  );
};
