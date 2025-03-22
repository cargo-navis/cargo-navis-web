import { useController, type UseControllerProps } from 'react-hook-form';

import { DatepickerWithLabels, type DatepickerWithLabelsProps } from '@/ui/hocs';

interface FormDatepickerProps extends Omit<DatepickerWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  isDisabled?: boolean;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
}

export const FormDatepicker: React.FC<FormDatepickerProps> = ({ name, isDisabled, initialValue, rules, ...rest }) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  const isRequired = !!rules?.required;

  return (
    <DatepickerWithLabels
      {...rest}
      isDisabled={isSubmitting}
      isRequired={isRequired}
      value={value}
      onChange={onChange}
    />
  );
};
