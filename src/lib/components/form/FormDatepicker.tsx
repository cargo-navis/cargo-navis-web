import { DatepickerProps } from '@/ui';
import { useController, UseControllerProps } from 'react-hook-form';
import { DatepickerWithLabels } from '@/ui/hocs';

interface FormDatepickerProps extends Omit<DatepickerProps, 'value' | 'onChange'> {
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

  return (
    <DatepickerWithLabels {...rest} isDisabled={isSubmitting} value={value} onChange={onChange} />
  );
}