import type { ReactNode } from 'react';

import { FlexLayout, Icon, Text } from '@/ui';

import { DateRange, DateRangeFilterWithLabels } from '../DateRangeFilter';
import { GranularityFilter, GranularityOption } from '../GranularityFilter';

interface AnalyticsFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  granularity: GranularityOption;
  onGranularityChange: (value: GranularityOption) => void;
  /** Tab-specific filters appended after the shared ones. */
  children?: ReactNode;
}

export const AnalyticsFilters = ({
  dateRange,
  onDateRangeChange,
  granularity,
  onGranularityChange,
  children,
}: AnalyticsFiltersProps) => (
  <FlexLayout className="gap-3">
    <DateRangeFilterWithLabels
      label={
        <FlexLayout className="gap-1 items-center justify-between">
          <Icon icon="IconCalendarCode" />
          <Text color="text-color-3" variant="text-xxs-medium">
            Razdoblje
          </Text>
        </FlexLayout>
      }
      value={dateRange}
      onChange={onDateRangeChange}
    />
    <GranularityFilter value={granularity} onChange={onGranularityChange} />
    {children ? <FlexLayout className="gap-3 items-center">{children}</FlexLayout> : null}
  </FlexLayout>
);
