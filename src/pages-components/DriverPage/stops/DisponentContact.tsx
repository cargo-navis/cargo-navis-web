import { Button } from '@/components/ui/button';
import type { DriverStopDisponent } from '@/lib/api/driver.d';
import { Icon } from '@/ui';

import { SectionTitle } from '../ui';
import { getDisponentName } from '../utils';

/**
 * Who to call about the stop or order, at the bottom of its drawer. The call button is big but soft red, so it never
 * competes with the confirm button above it. Renders nothing without a dispatcher.
 */
export const DisponentContact: React.FC<{ disponent: DriverStopDisponent | null }> = ({ disponent }) => {
  const name = disponent && getDisponentName(disponent);
  const phoneNumber = disponent?.phoneNumber;
  if (!name && !phoneNumber) return null;

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle className="text-muted-foreground" icon="IconUser">
        DISPONENT
      </SectionTitle>
      {name && <span className="font-medium">{name}</span>}
      {phoneNumber && (
        // tel: opens the phone app straight away
        <Button
          className="w-full"
          nativeButton={false}
          render={<a href={`tel:${phoneNumber.replaceAll(' ', '')}`} />}
          size="xl"
          variant="destructive"
        >
          <Icon data-icon="inline-start" icon="IconPhone" size="m" />
          Nazovi {phoneNumber}
        </Button>
      )}
    </div>
  );
};
