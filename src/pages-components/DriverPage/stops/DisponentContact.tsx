import type { DriverStopDisponent } from '@/lib/api/driver.d';
import { Box, Button, FlexLayout, Icon, Text } from '@/ui';

import { getDisponentName } from '../utils';

/**
 * Who to call about the stop or order, at the bottom of its sheet. The call button is big but secondary, so it never
 * competes with the confirm button above it. Renders nothing without a dispatcher.
 */
export const DisponentContact: React.FC<{ disponent: DriverStopDisponent | null }> = ({ disponent }) => {
  const name = disponent && getDisponentName(disponent);
  const phoneNumber = disponent?.phoneNumber;
  if (!name && !phoneNumber) return null;

  return (
    <FlexLayout className="flex-col gap-3">
      <FlexLayout className="items-center gap-2 text-dark-500 dark:text-light-300">
        <Icon icon="IconUser" size="s" />
        <Text variant="text-xxxs-bold">DISPONENT</Text>
        <Box className="h-[1px] grow bg-dark-200 dark:bg-light-800" />
      </FlexLayout>
      <FlexLayout className="flex-col gap-2">
        {name && (
          <Text color="text-color-1" variant="text-s-medium">
            {name}
          </Text>
        )}
        {phoneNumber && (
          // tel: opens the phone app straight away
          <Button
            href={`tel:${phoneNumber}`}
            iconLeft="IconPhone"
            isFullWidth
            size="l"
            text={`Nazovi ${phoneNumber}`}
            variant="danger"
          />
        )}
      </FlexLayout>
    </FlexLayout>
  );
};
