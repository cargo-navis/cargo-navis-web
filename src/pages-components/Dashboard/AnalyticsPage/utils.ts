import 'dayjs/locale/hr';

import dayjs from 'dayjs';

import type { GranularityOption } from './GranularityFilter';

dayjs.locale('hr');

export const TOP_N = 5;

export const getGranularityLabel = (granularity: GranularityOption): string => {
  switch (granularity) {
    case 'day':
      return '/ dnevno';
    case 'week':
      return '/ tjedno';
    case 'month':
      return '/ mj.';
    case 'year':
      return '/ god.';
  }
};

export const formatPeriodLabel = (period: string, granularity: GranularityOption): string => {
  switch (granularity) {
    case 'day': {
      // Format: "2025-01-15" → "15. sij." or "15. sij. 2024" if not current year
      const dayDate = dayjs(period);
      const isCurrentYear = dayDate.year() === dayjs().year();
      return isCurrentYear ? dayDate.format('D. MMM') : dayDate.format('D. MMM YYYY');
    }
    case 'week': {
      // Format: "2025-12-29 - 2026-01-04" → "29. pro. - 4. sij." or with years if not current year
      const weekMatch = period.match(/(\d{4}-\d{2}-\d{2}) - (\d{4}-\d{2}-\d{2})/);
      if (weekMatch) {
        const startDate = dayjs(weekMatch[1]);
        const endDate = dayjs(weekMatch[2]);
        const currentYear = dayjs().year();
        const startYear = startDate.year();
        const endYear = endDate.year();

        const startDay = startDate.format('D');
        const endDay = endDate.format('D');
        const startMonth = startDate.format('MMM');
        const endMonth = endDate.format('MMM');

        const isSameMonth = startDate.month() === endDate.month() && startYear === endYear;
        const bothInCurrentYear = startYear === currentYear && endYear === currentYear;
        const bothInSamePreviousYear = startYear === endYear && startYear !== currentYear;
        const spansDifferentYears = startYear !== endYear;

        if (bothInCurrentYear) {
          // No year needed
          if (isSameMonth) {
            return `${startDay}. - ${endDay}. ${endMonth}`;
          }
          return `${startDay}. ${startMonth} - ${endDay}. ${endMonth}`;
        } else if (bothInSamePreviousYear) {
          // Add year only to end date
          if (isSameMonth) {
            return `${startDay}. - ${endDay}. ${endMonth} ${endYear}`;
          }
          return `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${endYear}`;
        } else if (spansDifferentYears) {
          // Add year to both dates
          return `${startDay}. ${startMonth} ${startYear} - ${endDay}. ${endMonth} ${endYear}`;
        }
      }
      return period;
    }
    case 'month':
      // Format: "2025-01" → "Sij. 2025"
      return dayjs(period + '-01').format('M/YYYY');
    case 'year':
      // Format: "2025" → "2025"
      return period;
  }
};
