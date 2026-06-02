import { Box, FlexLayout, SelectOption, SingleSelect, Text } from '@/ui';

import { SortFieldEnum, useShipmentsSortLocalStorage } from '../hooks';

const SORT_OPTIONS: SelectOption[] = [
  {
    value: `${SortFieldEnum.LoadingReadyDate},desc`,
    label: 'Spremno za utovar ↓',
    iconLeft: 'IconPackageImport',
    helper: 'Najnoviji prvi',
  },
  {
    value: `${SortFieldEnum.LoadingReadyDate},asc`,
    label: 'Spremno za utovar ↑',
    iconLeft: 'IconPackageImport',
    helper: 'Najstariji prvi',
  },
  {
    value: `${SortFieldEnum.UnloadingDueDate},desc`,
    label: 'Rok istovara ↓',
    iconLeft: 'IconPackageExport',
    helper: 'Najnoviji prvi',
  },
  {
    value: `${SortFieldEnum.UnloadingDueDate},asc`,
    label: 'Rok istovara ↑',
    iconLeft: 'IconPackageExport',
    helper: 'Najstariji prvi',
  },
];

const SELECTABLE_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));

interface ShipmentsSortSelectorProps {
  isLoading?: boolean;
}

export const ShipmentsSortSelector = ({ isLoading }: ShipmentsSortSelectorProps) => {
  const { sort, setSort, clearSort } = useShipmentsSortLocalStorage();
  const currentValue = sort && SELECTABLE_VALUES.has(sort) ? sort : '';

  return (
    <FlexLayout className="items-center gap-2">
      <Text className="text-dark-600 dark:text-light-400 whitespace-nowrap" variant="text-xs-medium">
        Sortiraj:
      </Text>
      <Box className="w-[280px]">
        <SingleSelect
          isClearable
          isDisabled={isLoading}
          isPortal
          options={SORT_OPTIONS}
          placeholder="Odaberi..."
          value={currentValue}
          onChange={(value) => {
            if (!value) {
              clearSort();
              return;
            }
            const [field, direction] = value.split(',') as [SortFieldEnum, 'asc' | 'desc'];
            setSort(field, direction);
          }}
        />
      </Box>
    </FlexLayout>
  );
};
