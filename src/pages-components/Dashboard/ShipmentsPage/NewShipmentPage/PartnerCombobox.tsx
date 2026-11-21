import { CountryFlag } from '@/components/shared/country-flag';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { Client, Contractor } from '@/lib/api';

import { normalizeSearch as normalize } from '../../Partners/partners';

type PartnerItem = Pick<Client | Contractor, 'id' | 'name' | 'taxId'> & {
  address?: { placeName?: string; countryCode?: string } | null;
};

/** Name or tax id, ignoring case and diacritics („kras” finds „Kraš d.d.”). */
function matches(item: PartnerItem, query: string) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(item.name).includes(q) || normalize(item.taxId ?? '').includes(q);
}

/** Klijent / Podvozar picker (lab /nalog-form `PartnerCombobox`): name, under it flag + place · tax id. */
export function PartnerCombobox<T extends PartnerItem>({
  id,
  items,
  value,
  onChange,
  placeholder,
  invalid,
  onBlur,
}: {
  id: string;
  items: T[];
  value: string;
  onChange(id: string): void;
  placeholder: string;
  invalid?: boolean;
  onBlur?(): void;
}) {
  const selected = items.find((item) => item.id === value) ?? null;
  return (
    <Combobox
      autoHighlight
      filter={(item: T, query: string) => matches(item, query)}
      isItemEqualToValue={(a: T, b: T) => a.id === b.id}
      itemToStringLabel={(item: T) => item.name}
      items={items}
      value={selected}
      onValueChange={(next) => onChange((next as T | null)?.id ?? '')}
    >
      <ComboboxInput
        aria-invalid={invalid || undefined}
        className="w-full"
        id={id}
        placeholder={placeholder}
        showClear={!!selected}
        onBlur={onBlur}
      />
      <ComboboxContent>
        <ComboboxEmpty>Nema rezultata.</ComboboxEmpty>
        <ComboboxList>
          {(item: T) => (
            <ComboboxItem key={item.id} value={item}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{item.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {item.address?.countryCode && <CountryFlag code={item.address.countryCode} size="xxs" />}
                  {[item.address?.placeName, item.taxId].filter(Boolean).join(' · ')}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
