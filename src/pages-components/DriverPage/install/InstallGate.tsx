import { Box, FlexLayout, Text, TextButton } from '@/ui';

import type { InstallPlatform } from './installHint';
import { InstallInstructions } from './InstallInstructions';

interface InstallGateProps {
  platform: InstallPlatform;
  onInstall(): void;
  onContinueInBrowser(): void;
}

/** Full-screen install screen shown in a phone browser instead of the stops, once the driver is signed in. */
export const InstallGate: React.FC<InstallGateProps> = ({ platform, onInstall, onContinueInBrowser }) => (
  <FlexLayout className="grow flex-col justify-center gap-6 px-6 py-8">
    <FlexLayout className="flex-col items-center gap-3 text-center">
      <img alt="" className="size-[64px] rounded-l" src="/apple-touch-icon.png" />
      <Text as="h1" color="text-color-1" variant="text-l-medium">
        Instaliraj Cargo Navis
      </Text>
      <Text color="text-color-3" variant="text-s">
        Nalozi i postaje rade kao aplikacija na tvom mobitelu.
      </Text>
    </FlexLayout>
    <FlexLayout className="flex-col gap-4 rounded-l border border-dark-100 bg-white p-5 shadow-sm dark:border-light-850 dark:bg-light-875">
      <InstallInstructions layout="steps" platform={platform} onInstall={onInstall} />
    </FlexLayout>
    <FlexLayout className="flex-col items-center gap-4 text-center">
      {platform !== 'installed' && (
        <Text color="text-color-3" variant="text-xs">
          Već instalirano? Otvori Cargo Navis s početnog zaslona.
        </Text>
      )}
      <FlexLayout className="w-full items-center gap-3">
        <Box className="h-[1px] grow bg-dark-200 dark:bg-light-800" />
        <Text color="text-color-3" variant="text-xxs-medium">
          ILI
        </Text>
        <Box className="h-[1px] grow bg-dark-200 dark:bg-light-800" />
      </FlexLayout>
      <TextButton size="m" text="Nastavi u pregledniku" onClick={onContinueInBrowser} />
    </FlexLayout>
  </FlexLayout>
);
