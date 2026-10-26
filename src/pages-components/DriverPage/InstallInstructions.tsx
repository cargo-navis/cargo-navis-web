import { IconShare2 } from '@tabler/icons-react';

import { Box, Button, FlexLayout, Text } from '@/ui';

import type { InstallPlatform } from './installHint';

// Inline svg (not <Icon>, which is a block div) so it sits inside a sentence.
const ShareIcon = () => (
  <IconShare2 aria-hidden className="inline align-[-3px] text-dark-700 dark:text-light-100" size={16} />
);

const Step: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
  <FlexLayout className="items-start gap-3">
    <FlexLayout className="size-[24px] shrink-0 items-center justify-center rounded-circle bg-teal-50 dark:bg-teal-900">
      <Text color="text-teal-700 dark:text-teal-300" variant="text-xs-medium">
        {number}
      </Text>
    </FlexLayout>
    <Text className="pt-[2px]" color="text-color-2" variant="text-s">
      {children}
    </Text>
  </FlexLayout>
);

interface InstallInstructionsProps {
  platform: InstallPlatform;
  /** `steps`: numbered list for the full-screen gate. `compact`: one sentence for the card. */
  layout: 'steps' | 'compact';
  onInstall(): void;
}

/** How to install the driver portal in the current browser. */
export const InstallInstructions: React.FC<InstallInstructionsProps> = ({ platform, layout, onInstall }) => {
  if (platform === 'prompt') {
    return (
      <Box>
        <Button
          iconLeft="IconDownload"
          isFullWidth={layout === 'steps'}
          size={layout === 'steps' ? 'l' : 'm'}
          text="Instaliraj"
          onClick={onInstall}
        />
      </Box>
    );
  }

  if (platform === 'installed') {
    return (
      <Text color="text-color-2" variant={layout === 'steps' ? 'text-s' : 'text-xs'}>
        Aplikacija je instalirana. Otvori Cargo Navis s početnog zaslona.
      </Text>
    );
  }

  if (platform === 'ios-safari') {
    if (layout === 'compact') {
      return (
        <Text color="text-color-3" variant="text-xs">
          Dodirni <ShareIcon /> Podijeli, zatim „Dodaj na početni zaslon”.
        </Text>
      );
    }
    return (
      <FlexLayout className="flex-col gap-3">
        <Step number={1}>
          Dodirni <ShareIcon /> <strong>Podijeli</strong>
        </Step>
        <Step number={2}>
          Odaberi <strong>„Dodaj na početni zaslon”</strong>
        </Step>
        <Step number={3}>
          Otvori <strong>Cargo Navis</strong> s početnog zaslona
        </Step>
      </FlexLayout>
    );
  }

  return (
    <Text
      color={layout === 'steps' ? 'text-color-2' : 'text-color-3'}
      variant={layout === 'steps' ? 'text-s' : 'text-xs'}
    >
      {platform === 'ios-other'
        ? 'Ako si link otvorio u drugoj aplikaciji, u izborniku odaberi „Otvori u Safariju”, zatim dodaj aplikaciju na početni zaslon.'
        : 'Otvori link u Chromeu, zatim u izborniku ⋮ odaberi „Instaliraj aplikaciju”.'}
    </Text>
  );
};
