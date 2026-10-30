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
export const InstallHintCard: React.FC<InstallHintCardProps> = ({ platform, onInstall }) => {
  const isIos = platform === 'ios-safari' || platform === 'ios-other';

  return (
    <FlexLayout className="px-4 pb-2">
      {/* Blue sets "get the app" apart from the teal notifications card that can sit right below it. */}
      <FlexLayout className="w-full flex-col gap-2 rounded-l border border-blue-100 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-900/40">
        <FlexLayout className="items-center gap-2">
          <Icon color="text-blue-600 dark:text-blue-300" icon="IconDeviceMobileDown" size="m" />
          <Text color="text-blue-800 dark:text-blue-100" variant="text-s-medium">
            Koristi aplikaciju Cargo Navis
          </Text>
        </FlexLayout>
        <InstallInstructions layout="compact" platform={platform} onInstall={onInstall} />
        <Box as="hr" className="text-blue-100 dark:text-blue-800 my-1" />
        {/* iPhone browsers can't receive web push at all; only the installed app can. */}
        {isIos && (
          <FlexLayout className="gap-1 text-color-2">
            <Icon className="mt-[2px]" icon="IconBell" />
            <Text variant="text-xs">Instaliraj aplikaciju za obavijesti o novim postajama.</Text>
          </FlexLayout>
        )}
        <FlexLayout className="gap-1 text-orange-500">
          <Icon className="mt-[2px]" icon="IconInfoCircle" />
          <Text variant="text-xs">Ako je već imaš (a traži te ponovnu prijavu), obriši je i dodaj ponovno.</Text>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};
