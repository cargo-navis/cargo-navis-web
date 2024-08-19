import { Box } from '@/ui';

import { Checkbox } from './Checkbox';

export interface CheckboxGroupProps {
  name?: string;
  isDisabled?: boolean;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (value: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ isDisabled = false, name, values, options, onChange }) => {
  return (
    <Box className="flex flex-col py-2 gap-3">
      {options.map(({ value, label }) => (
        <Checkbox
          isDisabled={isDisabled}
          name={name}
          key={value}
          label={label}
          value={values.includes(value)}
          onChange={(isChecked) => {
            if (isChecked) {
              onChange([...values, value]);
            } else {
              const filteredValues = values.filter((val) => val !== value);
              onChange(filteredValues);
            }
          }}
        />
      ))}
    </Box>
  );
}