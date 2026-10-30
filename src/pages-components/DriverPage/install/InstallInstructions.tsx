import { createContext, useContext } from 'react';

import { Box, Button, FlexLayout, Icon, Text } from '@/ui';

import type { InstallPlatform } from './installHint';

type Layout = 'steps' | 'compact';

// Same numbered steps in both places; the card (`compact`) only renders them smaller.
const LayoutContext = createContext<Layout>('steps');

const SIZES = {
  steps: {
    listGap: 'gap-3',
    badge: 'size-[24px]',
    number: 'text-xs-medium',
    text: 'text-s',
    helper: 'text-xs',
    icon: 'm',
    offset: 'mt-[2px]',
  },
  compact: {
    listGap: 'gap-2',
    badge: 'size-[20px]',
    number: 'text-xxxs-medium',
    text: 'text-xs',
    helper: 'text-xxs',
    icon: 's',
    offset: 'mt-1',
  },
} as const;

function useSizes() {
  return SIZES[useContext(LayoutContext)];
}

const StepList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FlexLayout as="ol" className={`flex-col ${useSizes().listGap}`}>
    {children}
  </FlexLayout>
);

interface StepProps {
  number: number;
  helperText?: React.ReactNode;
  children: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, helperText, children }) => {
  const sizes = useSizes();
  return (
    <FlexLayout as="li" className="items-start gap-3">
      <FlexLayout
        className={`${sizes.badge} ${sizes.offset} shrink-0 items-center justify-center rounded-circle bg-teal-100 dark:bg-teal-900`}
      >
        <Text className="tabular-nums" color="text-teal-700 dark:text-teal-300" variant={sizes.number}>
          {number}
        </Text>
      </FlexLayout>
      <FlexLayout className="min-w-0 flex-col pt-[2px]">
        <FlexLayout className="flex-wrap items-center gap-x-1">{children}</FlexLayout>
        {helperText && <FlexLayout className="flex-wrap items-center gap-x-1">{helperText}</FlexLayout>}
      </FlexLayout>
    </FlexLayout>
  );
};

const StepText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text color="text-color-2" variant={useSizes().text}>
    {children}
  </Text>
);

const HelperText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text color="text-color-3" variant={useSizes().helper}>
    {children}
  </Text>
);

// The English label of the iOS share sheet item (with its icon), for iPhones set to English.
const AddToHomeScreenHelper = () => (
  <>
    <HelperText>Eng.</HelperText>
    <FlexLayout className="items-center gap-[2px]">
      <HelperText>&quot;</HelperText>
      <Icon color="text-dark-500 dark:text-light-300" icon="IconSquarePlus" size="m" />
      <HelperText>Add to Home Screen&quot;</HelperText>
    </FlexLayout>
  </>
);

const ShareIcon = () => <Icon color="text-dark-700 dark:text-light-100" icon="IconShare2" size={useSizes().icon} />;

const SafariIcon = () => (
  <Icon color="text-dark-700 dark:text-light-100" icon="IconBrandSafari" size={useSizes().icon} />
);

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
    <Step helperText={<AddToHomeScreenHelper />} number={startAt + 1}>
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

const PlatformSteps: React.FC<{ platform: 'ios-safari' | 'ios-other' | 'android-other' }> = ({ platform }) => {
  if (platform === 'ios-safari') {
    return (
      <StepList>
        <SafariSteps startAt={1} />
      </StepList>
    );
  }

  if (platform === 'ios-other') {
    // Chrome/Firefox/in-app browsers on iOS: switch to Safari first, then the Safari steps.
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

interface InstallInstructionsProps {
  platform: InstallPlatform;
  /** `steps`: the full-screen gate. `compact`: the same steps, smaller, for the card. */
  layout: Layout;
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
      <Text color="text-color-2" variant={SIZES[layout].text}>
        Aplikacija je instalirana. Otvori Cargo Navis s početnog zaslona.
      </Text>
    );
  }

  return (
    <LayoutContext.Provider value={layout}>
      <PlatformSteps platform={platform} />
    </LayoutContext.Provider>
  );
};
