import type React from 'react';

import { FlexLayout, SingleSelect, Text } from '@/ui';

export interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading = false,
}) => {
  const options = pageSizeOptions.map((size) => ({
    value: size.toString(),
    label: `${size} po stranici`,
  }));

  return (
    <FlexLayout className="items-center gap-2">
      <Text className="text-dark-600 dark:text-light-400 whitespace-nowrap" variant="text-xs-medium">
        Prikaži:
      </Text>
      <div className="w-28">
        <SingleSelect
          isDisabled={isLoading}
          isPortal
          options={options}
          placeholder="Odaberi..."
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange(Number(value))}
        />
      </div>
    </FlexLayout>
  );
};
