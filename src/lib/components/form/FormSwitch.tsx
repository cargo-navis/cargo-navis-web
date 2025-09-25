import { useController, type UseControllerProps } from 'react-hook-form';

import { SwitchWithLabels, type SwitchWithLabelsProps } from '@/ui/hocs';

export interface FormSwitchProps extends Omit<SwitchWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
}

export const FormSwitch: React.FC<FormSwitchProps> = ({ name, initialValue, rules, isDisabled, ...rest }) => {
  const {
    field: { value, onChange },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  const isRequired = !!rules?.required;

  return (
    <SwitchWithLabels
      {...rest}
      errorText={error?.message}
      isDisabled={isSubmitting || isDisabled}
      isRequired={isRequired}
      value={value}
      onChange={onChange}
    />
  );
};
