import { useRouter } from 'next/router';
import { useCallback } from 'react';

import type { SelectValue } from '@/ui/components/Select/Select';

import type { ShipmentsFiltersStorage } from '../hooks/useShipmentsFiltersLocalStorage';
import { useShipmentsFiltersLocalStorage } from '../hooks/useShipmentsFiltersLocalStorage';

interface UseFiltersLocalStorageStateOptions {
  paramName: keyof ShipmentsFiltersStorage;
  defaultValue?: SelectValue;
}

export const useFiltersLocalStorageState = ({ paramName, defaultValue = '' }: UseFiltersLocalStorageStateOptions) => {
  const paginationReset = usePaginationReset();
  const { storage, updateField, isReady } = useShipmentsFiltersLocalStorage();

  const handleChange = useCallback(
    (newValue: SelectValue) => {
      updateField(paramName, newValue);
      paginationReset();
    },
    [paramName, updateField, paginationReset]
  );

  const handleClearAll = useCallback(() => {
    updateField(paramName, undefined);
    paginationReset();
  }, [paramName, updateField, paginationReset]);

  // Get value from storage, fallback to defaultValue
  const value = (storage[paramName] as SelectValue) || defaultValue;

  return {
    value: isReady ? value : defaultValue,
    onChange: handleChange,
    onClearAll: handleClearAll,
  };
};

function usePaginationReset() {
  const router = useRouter();

  // Reset pagination to first page
  return useCallback(async () => {
    await router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: '1' },
      },
      undefined,
      { shallow: true }
    );
  }, [router]);
}
