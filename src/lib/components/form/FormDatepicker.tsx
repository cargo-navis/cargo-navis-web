import { DatepickerWithLabels, type DatepickerWithLabelsProps } from '@/ui/hocs';
import { type UseControllerProps, useController } from 'react-hook-form';

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

  return <DatepickerWithLabels {...rest} isDisabled={isSubmitting} value={value} onChange={onChange} />;
};
