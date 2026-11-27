import { createContext, useContext } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import type { InstallPlatform } from './installHint';

type Layout = 'steps' | 'compact';

// Same numbered steps in both places; the card (`compact`) only renders them smaller.
const LayoutContext = createContext<Layout>('steps');

const SIZES = {
  steps: {
    listGap: 'gap-3',
    badge: 'size-6 text-xs',
    text: 'text-base',
    helper: 'text-sm',
    icon: 'm',
    offset: 'mt-0.5',
  },
  compact: {
    listGap: 'gap-2',
    badge: 'size-5 text-[11px]',
    text: 'text-sm',
    helper: 'text-xs',
    icon: 's',
    offset: 'mt-px',
  },
} as const;

function useSizes() {
  return SIZES[useContext(LayoutContext)];
}

const StepList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ol className={cn('flex flex-col', useSizes().listGap)}>{children}</ol>
);

interface StepProps {
  number: number;
  helperText?: React.ReactNode;
  children: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, helperText, children }) => {
  const sizes = useSizes();
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-brand tabular-nums dark:bg-primary/60',
          sizes.badge,
          sizes.offset
        )}
      >
        {number}
      </span>
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-x-1">{children}</div>
        {helperText && <div className="flex flex-wrap items-center gap-x-1">{helperText}</div>}
      </div>
    </li>
  );
};

const StepText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className={cn('text-foreground', useSizes().text)}>{children}</span>
);

const HelperText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className={cn('text-muted-foreground', useSizes().helper)}>{children}</span>
);

// The English label of the iOS share sheet item (with its icon), for iPhones set to English.
const AddToHomeScreenHelper = () => (
  <>
    <HelperText>Eng.</HelperText>
    <span className="flex items-center gap-0.5">
      <HelperText>&quot;</HelperText>
      <Icon className="text-muted-foreground" icon="IconSquarePlus" size="m" />
      <HelperText>Add to Home Screen&quot;</HelperText>
    </span>
  </>
);

const ShareIcon = () => <Icon className="text-foreground" icon="IconShare2" size={useSizes().icon} />;

const SafariIcon = () => <Icon className="text-foreground" icon="IconBrandSafari" size={useSizes().icon} />;

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
      <Button className={cn(layout === 'steps' && 'w-full')} size="xl" onClick={onInstall}>
        <Icon data-icon="inline-start" icon="IconDownload" size="m" />
        Instaliraj
      </Button>
    );
  }

  if (platform === 'installed') {
    return <p className={SIZES[layout].text}>Aplikacija je instalirana. Otvori Cargo Navis s početnog zaslona.</p>;
  }

  return (
    <LayoutContext.Provider value={layout}>
      <PlatformSteps platform={platform} />
    </LayoutContext.Provider>
  );
};
