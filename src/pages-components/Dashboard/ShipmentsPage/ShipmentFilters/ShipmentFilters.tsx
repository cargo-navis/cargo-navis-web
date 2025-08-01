import { useState } from 'react';

import { Box, DisplayIf } from '@/ui';

import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';
import { FilterFields } from './FilterFields';
import { FilterHeader } from './FilterHeader';
import { FilterTags } from './FilterTags';

export const ShipmentFilters = () => {
  const { activeFiltersCount, onClearAll } = useShipmentsFiltersContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Box className="mt-4 border border-dark-200 dark:border-light-800 hover:border-dark-300 dark:hover:border-light-700 transition-colors duration-100 rounded-s">
      <FilterHeader
        activeFiltersCount={activeFiltersCount}
        hasActiveFilters={hasActiveFilters}
        isExpanded={isExpanded}
        onClearAll={onClearAll}
        onToggleExpanded={toggleExpanded}
      />
      {/* Collapsed state - show active filters */}
      <DisplayIf condition={!isExpanded && hasActiveFilters}>
        <FilterTags />
      </DisplayIf>
      {/* Expanded content */}
      <DisplayIf condition={isExpanded}>
        <FilterFields />
      </DisplayIf>
    </Box>
  );
};
