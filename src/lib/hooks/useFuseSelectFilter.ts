import Fuse, { type IFuseOptions } from 'fuse.js';
import { useCallback, useMemo, useState } from 'react';

/**
 * Fuzzy-filters a data array using Fuse.js, driven by a react-select
 * `onInputChange` callback. Returns the filtered (and score-sorted) data,
 * along with an `onInputChange` handler for react-select. When `onInputChange`
 * is passed to SingleSelect, it automatically disables the built-in filter.
 */
export function useFuseSelectFilter<T>(items: T[], fuseOptions: IFuseOptions<T>) {
  const [inputValue, setInputValue] = useState('');

  const fuse = useMemo(
    () => new Fuse(items, { threshold: 0.35, ...fuseOptions, includeScore: true }),
    [items, fuseOptions]
  );

  const filtered = useMemo(() => {
    const query = inputValue.trim();
    if (!query) return items;

    console.log(fuse.search(query));
    return fuse.search(query).map((r) => r.item);
  }, [items, inputValue, fuse]);

  const onInputChange = useCallback((newValue: string) => setInputValue(newValue), []);

  return { data: filtered, onInputChange };
}
