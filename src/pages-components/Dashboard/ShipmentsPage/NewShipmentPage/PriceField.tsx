import React from 'react';

import { FormTextInput } from '@/lib/components/form';

export const PriceField = () => {
  return (
    <FormTextInput
      iconLeft="CurrencyEuroIcon"
      inputMode="decimal"
      label="Cijena (Euro)"
      name="price"
      placeholder="XXX"
      rules={{ required: true }}
      type="text"
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if (
          ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
          (e.key === '.' && !e.currentTarget.value.includes('.')) ||
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
        // Allow paste only if it's a valid number format
        if (!/^\d*\.?\d*$/.test(pastedText)) {
          e.preventDefault();
        }
      }}
    />
  );
};
