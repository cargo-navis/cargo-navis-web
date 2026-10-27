import { Box, Button, FlexLayout, Icon, Text } from '@/ui';

import type { InstallPlatform } from './installHint';

const StepList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FlexLayout as="ol" className="flex-col gap-3">
    {children}
  </FlexLayout>
);

const Step: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
  <FlexLayout as="li" className="items-start gap-3">
    <FlexLayout className="size-[24px] shrink-0 items-center justify-center mt-[2px] rounded-circle bg-teal-50 dark:bg-teal-900">
      <Text className="tabular-nums" color="text-teal-700 dark:text-teal-300" variant="text-xs-medium">
        {number}
      </Text>
    </FlexLayout>
    <FlexLayout className="min-w-0 flex-wrap items-center gap-x-1 pt-[2px]">{children}</FlexLayout>
  </FlexLayout>
);

const StepText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text color="text-color-2" variant="text-s">
    {children}
  </Text>
);

const ShareIcon = () => <Icon color="text-dark-700 dark:text-light-100" icon="IconShare2" size="m" />;

const SafariIcon = () => <Icon color="text-dark-700 dark:text-light-100" icon="IconBrandSafari" size="m" />;

/** Steps inside Safari, shared by Safari itself and by other iOS browsers once they switch to Safari. */
const SafariSteps: React.FC<{ startAt: number }> = ({ startAt }) => (
  <>
    <Step number={startAt}>
      <StepText>Dodirni</StepText>
      <ShareIcon />
      <StepText>
        <strong>Podijeli</strong>
      </StepText>
    </Step>
    <Step number={startAt + 1}>
      <StepText>
        Odaberi <strong>„Dodaj na početni zaslon”</strong>
      </StepText>
    </Step>
    <Step number={startAt + 2}>
      <StepText>
        Otvori <strong>Cargo Navis</strong> s početnog zaslona
      </StepText>
    </Step>
  </>
);

const CompactLine: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <FlexLayout className="items-start gap-2">
    {icon && <Box className="mt-[4px]">{icon}</Box>}
    <Text color="text-color-3" variant="text-xs">
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
      return <CompactLine icon={<ShareIcon />}>Dodirni Podijeli, zatim „Dodaj na početni zaslon”.</CompactLine>;
    }
    return (
      <StepList>
        <SafariSteps startAt={1} />
      </StepList>
    );
  }

  if (platform === 'ios-other') {
    // Chrome/Firefox/in-app browsers on iOS: switch to Safari first, then the Safari steps.
    if (layout === 'compact') {
      return <CompactLine icon={<SafariIcon />}>Otvori link u Safariju, zatim ga dodaj na početni zaslon.</CompactLine>;
    }
    return (
      <StepList>
        <Step number={1}>
          <StepText>Otvori link u</StepText>
          <SafariIcon />
          <StepText>
            <strong>Safariju</strong>
          </StepText>
        </Step>
        <SafariSteps startAt={2} />
      </StepList>
    );
  }

  // android-other: no install dialog here, e.g. an in-app browser or Firefox. Any real browser can install the app.
  if (layout === 'compact') {
    return (
      <CompactLine>
        Otvori link u pregledniku (npr. Chrome), zatim u izborniku ⋮ odaberi „Instaliraj aplikaciju” ili „Dodaj na
        početni zaslon”.
      </CompactLine>
    );
  }
  return (
    <StepList>
      <Step number={1}>
        <StepText>
          Otvori link u <strong>pregledniku</strong> (npr. Chrome)
        </StepText>
      </Step>
      <Step number={2}>
        <StepText>
          U izborniku ⋮ odaberi <strong>„Instaliraj aplikaciju”</strong> ili <strong>„Dodaj na početni zaslon”</strong>
        </StepText>
      </Step>
      <Step number={3}>
        <StepText>
          Otvori <strong>Cargo Navis</strong> s početnog zaslona
        </StepText>
      </Step>
    </StepList>
  );
};
