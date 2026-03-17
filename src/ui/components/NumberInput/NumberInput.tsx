import { TextInput, TextInputProps } from '../TextInput';

function normalizeNumber(value: string) {
  let val = value;
  val = val.replace(',', '.');
  val = val.replace(/[^0-9.]/g, '');

  const parts = val.split('.');
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('');
  }
  return val;
}

export type NumberInputProps = TextInputProps;

export const NumberInput: React.FC<NumberInputProps> = ({ onChange, ...props }) => {
  return (
    <TextInput
      {...props}
      type="text"
      onChange={(value) => onChange(normalizeNumber(value))}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if (
          ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
          ((e.key === '.' || e.key === ',') && !e.currentTarget.value.includes('.')) ||
          // Allow Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
          ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
        ) {
          return;
        }
        // Prevent if not a number
        if (!/^\d$/.test(e.key)) {
          e.preventDefault();
        }
      }}
      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const normalizedText = normalizeNumber(pastedText);

        // Allow paste only if it's a valid number format
        if (!/^\d*\.?\d*$/.test(normalizedText)) {
          e.preventDefault();
        }
      }}
    />
  );
};
