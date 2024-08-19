import { useController, UseControllerProps } from 'react-hook-form';

import { RadioGroupWithLabels, RadioGroupWithLabelsProps } from '@/ui/hocs';

interface FormRadioInputProps extends Omit<RadioGroupWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
}

export const FormRadioGroup: React.FC<FormRadioInputProps> = ({ name, initialValue, rules, isDisabled, ...rest}) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules  });

  return (
    <RadioGroupWithLabels
      name={name}
      {...rest}
      isDisabled={isDisabled && isSubmitting}
      value={value}
      onChange={onChange}
    />
  );
}