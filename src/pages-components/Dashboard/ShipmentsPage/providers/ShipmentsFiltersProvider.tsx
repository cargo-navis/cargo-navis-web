import { useRouter } from 'next/router';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';

import {
  type ShipmentsFiltersStorage,
  ShipmentsFiltersStorageProvider,
  useShipmentsFiltersLocalStorage,
} from '../hooks/useShipmentsFiltersLocalStorage';

/** The list filters (today's 11 fields), remembered in localStorage. Dates are `YYYY-MM-DD`. */
export type ShipmentFilters = Omit<ShipmentsFiltersStorage, 'sort' | 'pageSize'>;

export const FILTER_KEYS = [
  'clientId',
  'driverId',
  'dispatcherId',
  'loadStatus',
  'invoiceStatus',
  'isInvoiceOverdue',
  'isAgency',
  'loadingReadyDateFrom',
  'loadingReadyDateTo',
  'unloadingDueDateFrom',
  'unloadingDueDateTo',
] as const satisfies readonly (keyof ShipmentFilters)[];

export type ShipmentsFiltersContextType = {
  filters: ShipmentFilters;
  activeFiltersCount: number;
  /** Set (or clear with `undefined`) some fields; back to page 1. */
  setFilters(patch: Partial<ShipmentFilters>): void;
  clearAll(): void;
  /** URL filters are about to replace the remembered ones: hold the list request. */
  isApplyingUrlFilters: boolean;
};

const ShipmentsFiltersContext = createContext<ShipmentsFiltersContextType | undefined>(undefined);

const ShipmentsFiltersProviderInner = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { storage, isReady, updateFields } = useShipmentsFiltersLocalStorage();

  const resetPage = useCallback(() => {
    void router.push({ pathname: router.pathname, query: { ...router.query, page: '1' } }, undefined, {
      shallow: true,
    });
  }, [router]);

  // Links from elsewhere (Početna tiles) carry filters in the URL, named after the API params
  // (?invoiceStatus=not_sent, ?loadingReadyDateFrom=2026-11-18 …). They win over the remembered ones: applied as the
  // whole filter set (so they show as chips), then dropped from the URL so the chips stay the one source.
  const urlFilterKey = FILTER_KEYS.filter((key) => typeof router.query[key] === 'string')
    .map((key) => `${key}=${router.query[key]}`)
    .join('&');
  useEffect(() => {
    if (!router.isReady || !isReady || !urlFilterKey) return;
    const fromUrl = Object.fromEntries(
      FILTER_KEYS.map((key) => [
        key,
        typeof router.query[key] === 'string' ? router.query[key] || undefined : undefined,
      ])
    ) as Partial<ShipmentFilters>;
    updateFields(fromUrl);
    const query = { ...router.query, page: '1' };
    FILTER_KEYS.forEach((key) => delete query[key]);
    void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    // Runs once per set of URL filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, isReady, urlFilterKey]);

  const filters = useMemo<ShipmentFilters>(
    () => (isReady ? Object.fromEntries(FILTER_KEYS.map((key) => [key, storage[key] || undefined])) : {}),
    [storage, isReady]
  );

  const setFilters = useCallback(
    (patch: Partial<ShipmentFilters>) => {
      updateFields(patch);
      resetPage();
    },
    [updateFields, resetPage]
  );

  // Clears the filters, keeps the sort and page size.
  const clearAll = useCallback(() => {
    updateFields(Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])));
    resetPage();
  }, [updateFields, resetPage]);

  const activeFiltersCount = FILTER_KEYS.filter((key) => !!filters[key]).length;

  return (
    <ShipmentsFiltersContext.Provider
      value={{ filters, activeFiltersCount, setFilters, clearAll, isApplyingUrlFilters: !!urlFilterKey }}
    >
      {children}
    </ShipmentsFiltersContext.Provider>
  );
};

export const ShipmentsFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ShipmentsFiltersStorageProvider>
      <ShipmentsFiltersProviderInner>{children}</ShipmentsFiltersProviderInner>
    </ShipmentsFiltersStorageProvider>
  );
};

export const useShipmentsFiltersContext = () => {
  const state = useContext(ShipmentsFiltersContext);

  if (!state) {
    throw new Error('useShipmentsFiltersContext must be used within a ShipmentsFiltersProvider');
  }

  return state;
};
