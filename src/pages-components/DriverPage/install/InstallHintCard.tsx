import { Box, FlexLayout, Icon, Text } from '@/ui';

import type { InstallPlatform } from './installHint';
import { InstallInstructions } from './InstallInstructions';

interface InstallHintCardProps {
  platform: InstallPlatform;
  onInstall(): void;
}

/**
 * Reminder above the stops after "Nastavi u pregledniku". Not dismissible. Also covers the iOS case where the
 * installed app's session expired: the app only gets cookies when it is added, so it has to be re-added.
 */
export const InstallHintCard: React.FC<InstallHintCardProps> = ({ platform, onInstall }) => (
  <FlexLayout className="px-4 pb-2">
    <FlexLayout className="w-full flex-col gap-2 rounded-l border border-dark-100 bg-white p-4 shadow-sm dark:border-light-850 dark:bg-light-875">
      <Text color="text-color-1" variant="text-s-medium">
        Koristi aplikaciju Cargo Navis
      </Text>
      <InstallInstructions layout="compact" platform={platform} onInstall={onInstall} />
      <Box as="hr" className="text-dark-200 dark:text-light-800 my-1" />
      <FlexLayout className="gap-1 text-orange-500">
        <Icon className="mt-[2px]" icon="IconInfoCircle" />
        <Text variant="text-xs">Ako je već imaš (a traži te ponovnu prijavu), obriši je i dodaj ponovno.</Text>
      </FlexLayout>
    </FlexLayout>
  </FlexLayout>
);
