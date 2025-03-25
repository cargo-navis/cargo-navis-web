import { useController, type UseControllerProps } from 'react-hook-form';

import { YearpickerWithLabels, type YearpickerWithLabelsProps } from '@/ui/hocs';

interface FormYearpickerProps extends Omit<YearpickerWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  isDisabled?: boolean;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
}

export const FormYearpicker: React.FC<FormYearpickerProps> = ({ name, isDisabled, initialValue, rules, ...rest }) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  return <YearpickerWithLabels {...rest} isDisabled={isSubmitting} value={value} onChange={onChange} />;
};
