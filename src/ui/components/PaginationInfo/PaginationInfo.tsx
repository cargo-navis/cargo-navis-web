import type React from 'react';

import { Text } from '@/ui';

export interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  className?: string;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({ currentPage, pageSize, totalElements, className }) => {
  const startItem = Math.max(1, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(totalElements, currentPage * pageSize);

  if (totalElements === 0) {
    return (
      <Text className={className} variant="text-xs-medium">
        Nema rezultata
      </Text>
    );
  }

  return (
    <Text className={className} variant="text-xs-medium">
      Prikazano {startItem.toLocaleString()} do {endItem.toLocaleString()} (od {totalElements.toLocaleString()}{' '}
      rezultata)
    </Text>
  );
};
