import clsx from 'clsx';
import { useState } from 'react';

import { LoadStatus } from '@/lib/api/shipments';
import { loadStatusConfig } from '@/pages-components/Dashboard/ShipmentsPage/const';
import { Box, FlexLayout, Pill } from '@/ui';

interface LoadStatusProgressProps {
  currentStatus: LoadStatus;
  onStatusChange: (status: LoadStatus) => void;
  isPending: boolean;
}

export const LoadStatusProgress: React.FC<LoadStatusProgressProps> = ({ currentStatus, onStatusChange, isPending }) => {
  const statuses = Object.values(LoadStatus);
  const currentIndex = statuses.indexOf(currentStatus);
  const [hoveredStatus, setHoveredStatus] = useState<LoadStatus | null>(null);

  return (
    <FlexLayout className="flex-col gap-4">
      <FlexLayout className="items-center gap-2">
        {statuses.map((status, index) => {
          const config = loadStatusConfig[status];
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const isHovered = hoveredStatus === status;

          const opacity = isCurrent || isHovered ? 'opacity-100' : 'opacity-50';
          const variant = isFuture && !isHovered ? 'default' : config.variant;

          return (
            <FlexLayout className="items-center" key={status}>
              <Box
                className={clsx('cursor-pointer transition-opacity', opacity)}
                isDisabled={isPending}
                onClick={() => !isPending && onStatusChange(status)}
                onMouseEnter={() => !isPending && setHoveredStatus(status)}
                onMouseLeave={() => !isPending && setHoveredStatus(null)}
              >
                <Pill text={config.label} variant={variant} />
              </Box>
              {index < statuses.length - 1 && <Box className="w-8 h-[2px] bg-light-200 dark:bg-white-alpha-25 mx-2" />}
            </FlexLayout>
          );
        })}
      </FlexLayout>
    </FlexLayout>
  );
};
