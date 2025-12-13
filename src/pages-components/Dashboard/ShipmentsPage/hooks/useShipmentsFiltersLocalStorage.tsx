import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { SelectValue } from '@/ui/components/Select/Select';

const STORAGE_KEY = 'cargo-navis-shipments-filters';

export interface ShipmentsFiltersStorage {
  clientId?: string;
  driverId?: string;
  dispatcherId?: string;
  loadStatus?: string;
  invoiceStatus?: string;
  loadingDateFrom?: string;
  loadingDateTo?: string;
  unloadingDateFrom?: string;
  unloadingDateTo?: string;
  sort?: string; // format: "field,direction" e.g. "loadingDate,desc"
  pageSize?: string;
}

interface StorageContextType {
  storage: ShipmentsFiltersStorage;
  isReady: boolean;
  updateField: (field: keyof ShipmentsFiltersStorage, value: SelectValue | string | undefined) => void;
  updateFields: (updates: Partial<ShipmentsFiltersStorage>) => void;
  clearAll: () => void;
  getField: (field: keyof ShipmentsFiltersStorage) => SelectValue;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const getDefaultStorage = (): ShipmentsFiltersStorage => ({});

const readFromStorage = (): ShipmentsFiltersStorage => {
  if (typeof window === 'undefined') return getDefaultStorage();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultStorage();
    }
    return JSON.parse(stored) as ShipmentsFiltersStorage;
  } catch (error) {
    console.error('Failed to read shipments filters from localStorage:', error);
    return getDefaultStorage();
  }
};

const writeToStorage = (data: ShipmentsFiltersStorage): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to write shipments filters to localStorage:', error);
  }
};

const clearStorage = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear shipments filters from localStorage:', error);
  }
};

export const ShipmentsFiltersStorageProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [storage, setStorage] = useState<ShipmentsFiltersStorage>(getDefaultStorage);
  const [isReady, setIsReady] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initialStorage = readFromStorage();
    setStorage(initialStorage);
    setIsReady(true);
  }, []);

  // Update a specific field in storage
  const updateField = useCallback((field: keyof ShipmentsFiltersStorage, value: SelectValue | string | undefined) => {
    setStorage((prev) => {
      const updated = { ...prev };

      if (value === undefined || value === null || value === '') {
        delete updated[field];
      } else {
        (updated[field] as string) = String(value);
      }

      writeToStorage(updated);
      return updated;
    });
  }, []);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<ShipmentsFiltersStorage>) => {
    setStorage((prev) => {
      const updated = { ...prev };

      for (const [key, value] of Object.entries(updates)) {
        const field = key as keyof ShipmentsFiltersStorage;
        if (value === undefined || value === null || value === '') {
          delete updated[field];
        } else {
          updated[field] = String(value);
        }
      }

      writeToStorage(updated);
      return updated;
    });
  }, []);

  // Clear all filters and sort
  const clearAll = useCallback(() => {
    setStorage(getDefaultStorage());
    clearStorage();
  }, []);

  // Get a specific field value
  const getField = useCallback(
    (field: keyof ShipmentsFiltersStorage): SelectValue => {
      return storage[field] || '';
    },
    [storage]
  );

  return (
    <StorageContext.Provider
      value={{
        storage,
        isReady,
        updateField,
        updateFields,
        clearAll,
        getField,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useShipmentsFiltersLocalStorage = () => {
  const context = useContext(StorageContext);

  if (!context) {
    throw new Error('useShipmentsFiltersLocalStorage must be used within a ShipmentsFiltersStorageProvider');
  }

  return context;
};
