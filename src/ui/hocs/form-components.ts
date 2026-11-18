import { TextInput, type TextInputProps } from '../components';
import { type FieldLabelsProps, withFieldLabels } from './form';

// The old labelled field, still used by Prijava / Postavi lozinku (lib/components/form).
export const TextInputWithLabels: React.FC<TextInputProps & FieldLabelsProps & React.RefAttributes<HTMLInputElement>> =
  withFieldLabels(TextInput);
export type TextInputWithLabelsProps = React.ComponentPropsWithRef<typeof TextInputWithLabels>;
