import type { DriverStop } from '@/lib/api/driver';
import { BottomSheet } from '@/ui';

import { getStopCompanyName } from '../utils';
import { CompleteStopButton } from './CompleteStopButton';
import { StopSummary } from './StopCard';
import { StopDetails } from './StopDetails';
import { StopDocuments } from './StopDocuments';

interface StopDrawerProps {
  /** Kept set while closing, so the content doesn't vanish during the slide-out. */
  stop: DriverStop | null;
  isNext: boolean;
  isOpen: boolean;
  onOpenChange(isOpen: boolean): void;
}

export const StopDrawer: React.FC<StopDrawerProps> = ({ stop, isNext, isOpen, onOpenChange }) => (
  <BottomSheet
    header={stop && <StopSummary isNext={isNext} showDate stop={stop} />}
    isOpen={isOpen}
    title={(stop && getStopCompanyName(stop)) ?? 'Postaja'}
    onOpenChange={onOpenChange}
  >
    {stop && (
      <StopDetails
        actions={
          <>
            <CompleteStopButton stop={stop} />
            <StopDocuments stop={stop} />
          </>
        }
        showSideBars
        stop={stop}
      />
    )}
  </BottomSheet>
);
