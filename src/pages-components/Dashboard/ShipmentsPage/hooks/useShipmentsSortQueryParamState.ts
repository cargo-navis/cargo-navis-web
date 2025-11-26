import { useRouter } from 'next/router';

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

export const useShipmentsSortQueryParamState = (): SortState => {
  const router = useRouter();

  // Get current sort value from URL
  const sortParam = (router.query.sort as string) || '';

  // Parse sort parameter: format is "field,direction" (e.g., "loadingDate,desc", "price,asc")
  const parseSort = (sort: string): { field: SortFieldEnum | null; direction: 'asc' | 'desc' | null } => {
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

  const { field: currentField, direction: currentDirection } = parseSort(sortParam);

  const getSortField = (): SortFieldEnum | null => {
    return currentField;
  };

  const getSortDirection = (field: SortFieldEnum): 'asc' | 'desc' | null => {
    if (currentField === field) {
      return currentDirection;
    }
    return null;
  };

  const isFieldSorted = (field: SortFieldEnum): boolean => {
    return currentField === field;
  };

  const toggleSort = (fieldToSort: SortFieldEnum) => {
    const query = { ...router.query };

    const isCurrentlyActive = currentField === fieldToSort;

    // Cycle through: none → desc → asc → none
    if (!isCurrentlyActive) {
      // First click: set to desc
      query.sort = `${fieldToSort},desc`;
    } else if (currentDirection === 'desc') {
      // Second click: change to asc
      query.sort = `${fieldToSort},asc`;
    } else {
      // Third click: remove sort param (will default to createdAt,desc)
      delete query.sort;
    }

    // Reset pagination to first page on sort change
    query.page = '1';

    void router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  return {
    sort: sortParam && currentField ? sortParam : null,
    isRouterReady: router.isReady,
    getSortField,
    getSortDirection,
    isFieldSorted,
    toggleSort,
  };
};
