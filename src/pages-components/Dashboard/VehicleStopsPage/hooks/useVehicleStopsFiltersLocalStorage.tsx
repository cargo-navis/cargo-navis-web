import { useCallback, useState } from 'react';

const projectEnv = process.env.PROJECT_ENV;

if (!projectEnv) {
  throw new Error('Missing PROJECT_ENV env var.');
}

const isProductionEnv = process.env.PROJECT_ENV === 'production';

const keyName = 'cargo-navis-vehicle-stops-filters';
const STORAGE_KEY = isProductionEnv ? keyName : `${projectEnv.toLowerCase()}-${keyName}`;

export interface VehicleStopsFiltersStorage {
  driverId?: string;
}

const getDefaultStorage = (): VehicleStopsFiltersStorage => ({});

const readFromStorage = (): VehicleStopsFiltersStorage => {
  if (typeof window === 'undefined') return getDefaultStorage();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultStorage();
    return JSON.parse(stored) as VehicleStopsFiltersStorage;
  } catch (error) {
    console.error('Failed to read vehicle stops filters from localStorage:', error);
    return getDefaultStorage();
  }
};

const writeToStorage = (data: VehicleStopsFiltersStorage): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to write vehicle stops filters to localStorage:', error);
  }
};

export const useVehicleStopsFiltersLocalStorage = () => {
  const [storage, setStorage] = useState<VehicleStopsFiltersStorage>(readFromStorage);

  const updateField = useCallback((field: keyof VehicleStopsFiltersStorage, value: string | undefined) => {
    setStorage((prev) => {
      const updated = { ...prev };

      if (value === undefined || value === null || value === '') {
        delete updated[field];
      } else {
        updated[field] = value;
      }

      writeToStorage(updated);
      return updated;
    });
  }, []);

  return { storage, updateField };
};
