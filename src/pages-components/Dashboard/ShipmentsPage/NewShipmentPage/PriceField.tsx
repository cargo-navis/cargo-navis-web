import React from 'react';

import { FormNumberInput } from '@/lib/components/form';

export const PriceField = () => {
  return (
    <FormNumberInput
      iconLeft="CurrencyEuroIcon"
      inputMode="decimal"
      label="Cijena (Euro)"
      name="price"
      placeholder="XXX"
      rules={{ required: true }}
    />
  );
};
