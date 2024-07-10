import { TextInput, TextInputProps } from '../components';
import { FieldLabelsProps, withFieldLabels } from './form';

export const TextInputWithLabels: React.FC<
  TextInputProps & FieldLabelsProps & React.RefAttributes<HTMLInputElement>
> = withFieldLabels(TextInput);