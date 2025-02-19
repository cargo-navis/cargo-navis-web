import { useController, type UseControllerProps } from 'react-hook-form';
import type { AsyncProps } from 'react-select/async';

import { AsyncSelectWithLabels, type AsyncSelectWithLabelsProps } from '@/ui/hocs';

export interface FormAsyncSelectProps extends Omit<AsyncSelectWithLabelsProps, 'value' | 'onChange' | 'loadOptions'> {
  name: string;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
  promisedOptions: AsyncProps<any, false, any>['loadOptions'];
}

export const FormAsyncSelect: React.FC<FormAsyncSelectProps> = (props) => {
  const { name, initialValue, rules, isDisabled, promisedOptions, ...rest } = props;
  const {
    field: { value, onChange, onBlur },
    fieldState: { isTouched, isDirty, error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  return (
    <AsyncSelectWithLabels
      name={name}
      {...rest}
      errorText={(initialValue && error?.message) || ((isTouched && isDirty && error?.message) as string)}
      isDisabled={isSubmitting || isDisabled}
      loadOptions={promisedOptions}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};
