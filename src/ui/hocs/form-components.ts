import {
  CheckboxGroup,
  CheckboxGroupProps,
  Datepicker,
  DatepickerProps,
  RadioGroup,
  RadioGroupProps,
  TextInput,
  TextInputProps
} from '../components';
import { FieldLabelsProps, withFieldLabels } from './form';

export const TextInputWithLabels: React.FC<
  TextInputProps & FieldLabelsProps & React.RefAttributes<HTMLInputElement>
> = withFieldLabels(TextInput);

export const RadioGroupWithLabels: React.FC<RadioGroupProps & FieldLabelsProps> = withFieldLabels(RadioGroup);

export const CheckboxGroupWithLabels: React.FC<CheckboxGroupProps & FieldLabelsProps> = withFieldLabels(CheckboxGroup);

export const DatepickerWithLabels: React.FC<DatepickerProps & FieldLabelsProps> = withFieldLabels(Datepicker);