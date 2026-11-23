import * as React from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Spinner } from '@/components/ui/spinner';
import { plural } from '@/lib/utils/plural';

/**
 * Combobox that searches the server as you type (lab /forms select-fields.tsx `AsyncClientCombobox`, today's
 * FormAsyncSelect): the selected item fills the input, typing anything else searches after `minChars`; „Tražim…”
 * while waiting, „Nema … „query”” when nothing matches. Presentational: the page passes `search` (an API call).
 * Searches wait until typing pauses (SEARCH_DEBOUNCE_MS), so „10000” is one request, not five.
 */
const SEARCH_DEBOUNCE_MS = 300;

export function AsyncCombobox<T>({
  id,
  value,
  onValueChange,
  search,
  getKey,
  getLabel,
  renderItem,
  minChars = 2,
  placeholder = 'Traži…',
  noResults = (query) => `Nema rezultata za „${query}”.`,
  invalid,
  disabled,
  ref,
  onBlur,
}: {
  id?: string;
  value: T | null;
  onValueChange(value: T | null): void;
  search(query: string): Promise<T[]>;
  getKey(item: T): string;
  getLabel(item: T): string;
  /** Row content; defaults to the label. */
  renderItem?(item: T): React.ReactNode;
  minChars?: number;
  placeholder?: string;
  noResults?(query: string): string;
  invalid?: boolean;
  disabled?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  onBlur?(): void;
}) {
  const [inputValue, setInputValue] = React.useState('');
  const [results, setResults] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const requestRef = React.useRef(0);
  const searchRef = React.useRef(search);
  searchRef.current = search;

  // The selected item fills the input; typing anything else searches.
  const label = value ? getLabel(value) : '';
  const query = inputValue === label ? '' : inputValue.trim();

  React.useEffect(() => {
    if (query.length < minChars) return;
    // „Tražim…” at once (no „Nema rezultata” flash between keystrokes); the request only once typing pauses.
    const request = ++requestRef.current;
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      searchRef.current(query).then(
        (items) => {
          if (request !== requestRef.current) return;
          setResults(items);
          setIsLoading(false);
        },
        () => {
          if (request !== requestRef.current) return;
          setResults([]);
          setIsLoading(false);
        }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query, minChars]);

  const items = query.length < minChars ? (value ? [value] : []) : results;

  function emptyText() {
    if (query.length < minChars) return `Upiši barem ${minChars} ${plural(minChars, ['slovo', 'slova', 'slova'])}.`;
    if (isLoading) return null;
    return noResults(query);
  }

  return (
    <Combobox
      disabled={disabled}
      filter={null}
      inputValue={inputValue}
      isItemEqualToValue={(a: T, b: T) => getKey(a) === getKey(b)}
      itemToStringLabel={getLabel}
      items={items}
      value={value}
      onInputValueChange={setInputValue}
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
        {isLoading && query.length >= minChars && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <Spinner /> Tražim…
          </div>
        )}
        <ComboboxEmpty>{emptyText()}</ComboboxEmpty>
        <ComboboxList>
          {(item: T) => (
            <ComboboxItem key={getKey(item)} value={item}>
              {renderItem ? renderItem(item) : getLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
