import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

import { useShipmentsFiltersLocalStorage } from './useShipmentsFiltersLocalStorage';

export enum SortFieldEnum {
  LoadingDate = 'loadingDate',
  UnloadingDate = 'unloadingDate',
  Price = 'price',
}

interface SortState {
  sort: string | null;
  isRouterReady: boolean;
  getSortField(): SortFieldEnum | null;
  getSortDirection(field: SortFieldEnum): 'asc' | 'desc' | null;
  isFieldSorted(field: SortFieldEnum): boolean;
  toggleSort(field: SortFieldEnum): void;
}

// Parse sort parameter: format is "field,direction" (e.g., "loadingDate,desc", "price,asc")
const parseSort = (sort: string | undefined): { field: SortFieldEnum | null; direction: 'asc' | 'desc' | null } => {
  if (!sort || sort === 'createdAt,desc') {
    return { field: null, direction: null };
  }

  const [field, direction] = sort.split(',');
  if (field && (direction === 'asc' || direction === 'desc')) {
    // Validate that field is one of the allowed SortFieldEnum values
    if (Object.values(SortFieldEnum).includes(field as SortFieldEnum)) {
      return { field: field as SortFieldEnum, direction: direction as 'asc' | 'desc' };
    }
  }

  return { field: null, direction: null };
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

export const useShipmentsSortLocalStorage = (): SortState => {
  const paginationReset = usePaginationReset();
  const { storage, updateField, isReady } = useShipmentsFiltersLocalStorage();

  // Get current sort value from localStorage
  const sortParam = storage.sort;

  // Parse sort parameter
  const { field: currentField, direction: currentDirection } = useMemo(() => parseSort(sortParam), [sortParam]);

  const getSortField = useCallback((): SortFieldEnum | null => {
    return currentField;
  }, [currentField]);

  const getSortDirection = useCallback(
    (field: SortFieldEnum): 'asc' | 'desc' | null => {
      if (currentField === field) {
        return currentDirection;
      }
      return null;
    },
    [currentField, currentDirection]
  );

  const isFieldSorted = useCallback(
    (field: SortFieldEnum): boolean => {
      return currentField === field;
    },
    [currentField]
  );

  const toggleSort = useCallback(
    (fieldToSort: SortFieldEnum) => {
      const isCurrentlyActive = currentField === fieldToSort;

      // Cycle through: none → desc → asc → none
      if (!isCurrentlyActive) {
        // First click: set to desc
        updateField('sort', `${fieldToSort},desc`);
      } else if (currentDirection === 'desc') {
        // Second click: change to asc
        updateField('sort', `${fieldToSort},asc`);
      } else {
        // Third click: remove sort (will default to createdAt,desc)
        updateField('sort', undefined);
      }

      // Reset pagination to first page on sort change
      void paginationReset();
    },
    [currentField, currentDirection, updateField, paginationReset]
  );

  return {
    sort: sortParam && currentField ? sortParam : null,
    isRouterReady: isReady, // Keep API compatibility, but use isReady from localStorage hook
    getSortField,
    getSortDirection,
    isFieldSorted,
    toggleSort,
  };
};
