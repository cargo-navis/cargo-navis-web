import * as React from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { type Country, getCountryOptions } from '@/lib/utils/countries';

import { CountryFlag } from './country-flag';

/**
 * Country field: searchable, flag + Croatian name + code (lab /forms select-fields.tsx `CountryCombobox`). Countries
 * from src/lib/utils/countries (all by default; pass `getEuropeCountryOptions()` for the European subset).
 */
export function CountryCombobox({
  id,
  value,
  onValueChange,
  countries,
  invalid,
  disabled,
  placeholder = 'Odaberi državu',
  ref,
  onBlur,
}: {
  id?: string;
  value: Country | null;
  onValueChange(value: Country | null): void;
  countries?: Country[];
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  ref?: React.Ref<HTMLInputElement>;
  onBlur?(): void;
}) {
  const items = React.useMemo(() => countries ?? getCountryOptions(), [countries]);
  return (
    <Combobox
      autoHighlight
      disabled={disabled}
      isItemEqualToValue={(a: Country, b: Country) => a.code === b.code}
      itemToStringLabel={(country: Country) => country.name}
      items={items}
      value={value}
      onValueChange={onValueChange}
    >
      <ComboboxInput
        aria-invalid={invalid || undefined}
        className="w-full"
        disabled={disabled}
        id={id}
        placeholder={placeholder}
        ref={ref}
        showClear={!!value}
        onBlur={onBlur}
      />
      <ComboboxContent>
        <ComboboxEmpty>Nema te države.</ComboboxEmpty>
        <ComboboxList>
          {(country: Country) => (
            <ComboboxItem key={country.code} value={country}>
              <CountryFlag code={country.code} size="xs" />
              {country.name}
              <span className="ml-auto font-mono text-xs text-muted-foreground">{country.code}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
