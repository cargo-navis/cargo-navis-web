import { useController, type UseControllerProps } from 'react-hook-form';

import { SingleSelectWithLabels, type SingleSelectWithLabelsProps } from '@/ui/hocs';

interface FormSingleSelectProps extends Omit<SingleSelectWithLabelsProps, 'value' | 'onChange'> {
  name: string;
  initialValue?: string;
  rules?: UseControllerProps['rules'];
}

export const FormSingleSelect: React.FC<FormSingleSelectProps> = (props) => {
  const { name, initialValue, rules, isDisabled, ...rest } = props;
  const {
    field: { value, onChange, onBlur },
    fieldState: { isTouched, isDirty, error },
    formState: { isSubmitting },
  } = useController({ name, defaultValue: initialValue, rules });

  return (
    <SingleSelectWithLabels
      name={name}
      {...rest}
      errorText={(initialValue && error?.message) || ((isTouched && isDirty && error?.message) as string)}
      isDisabled={isSubmitting || isDisabled}
      value={value}
      onBlur={onBlur}
      onChange={(newValue) => {
        // When the clear button is clicked, react-select will pass null
        // We need to explicitly pass null/empty value to prevent it from resetting to default
        onChange(newValue === undefined ? '' : newValue);
      }}
    />
  );
};
