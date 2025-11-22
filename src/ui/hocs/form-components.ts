import {
  AsyncSelect,
  CheckboxGroup,
  type CheckboxGroupProps,
  Datepicker,
  type DatepickerProps,
  NumberInput,
  NumberInputProps,
  RadioGroup,
  type RadioGroupProps,
  SingleSelect,
  type SingleSelectProps,
  Switch,
  type SwitchProps,
  Textarea,
  type TextareaProps,
  TextInput,
  type TextInputProps,
  Yearpicker,
  type YearpickerProps,
} from '../components';
import { type FieldLabelsProps, withFieldLabels } from './form';

export const TextInputWithLabels: React.FC<TextInputProps & FieldLabelsProps & React.RefAttributes<HTMLInputElement>> =
  withFieldLabels(TextInput);
export type TextInputWithLabelsProps = React.ComponentPropsWithRef<typeof TextInputWithLabels>;

export const NumberInputWithLabels: React.FC<NumberInputProps & FieldLabelsProps> = withFieldLabels(NumberInput);
export type NumberInputWithLabelsProps = React.ComponentProps<typeof NumberInputWithLabels>;

export const RadioGroupWithLabels: React.FC<RadioGroupProps & FieldLabelsProps> = withFieldLabels(RadioGroup);
export type RadioGroupWithLabelsProps = React.ComponentPropsWithRef<typeof RadioGroupWithLabels>;

export const CheckboxGroupWithLabels: React.FC<CheckboxGroupProps & FieldLabelsProps> = withFieldLabels(CheckboxGroup);
export type CheckboxGroupWithLabelsProps = React.ComponentPropsWithRef<typeof CheckboxGroupWithLabels>;

export const DatepickerWithLabels: React.FC<DatepickerProps & FieldLabelsProps> = withFieldLabels(Datepicker);
export type DatepickerWithLabelsProps = React.ComponentPropsWithRef<typeof DatepickerWithLabels>;

export const YearpickerWithLabels: React.FC<YearpickerProps & FieldLabelsProps> = withFieldLabels(Yearpicker);
export type YearpickerWithLabelsProps = React.ComponentPropsWithRef<typeof YearpickerWithLabels>;

export const SingleSelectWithLabels: React.FC<Omit<SingleSelectProps & FieldLabelsProps, 'charLimitText'>> =
  withFieldLabels(SingleSelect);
export type SingleSelectWithLabelsProps = React.ComponentProps<typeof SingleSelectWithLabels>;

export const AsyncSelectWithLabels = withFieldLabels(AsyncSelect);
export type AsyncSelectWithLabelsProps = React.ComponentPropsWithRef<typeof AsyncSelectWithLabels>;

export const TextareaWithLabels: React.FC<TextareaProps & FieldLabelsProps> = withFieldLabels(Textarea);
export type TextareaWithLabelsProps = React.ComponentProps<typeof TextareaWithLabels>;

export const SwitchWithLabels: React.FC<SwitchProps & FieldLabelsProps> = withFieldLabels(Switch);
export type SwitchWithLabelsProps = React.ComponentProps<typeof SwitchWithLabels>;
