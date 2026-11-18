import { Alert, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/ui';

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
    <div className="px-4 pb-2">
      <Alert icon="IconDeviceMobileDown" variant="info">
        <AlertTitle>Koristi aplikaciju Cargo Navis</AlertTitle>
        <div className="flex flex-col gap-2 pt-1.5">
          <InstallInstructions layout="compact" platform={platform} onInstall={onInstall} />
          <hr className="my-1 border-info/20" />
          {/* iPhone browsers can't receive web push at all; only the installed app can. */}
          {isIos && (
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <Icon className="mt-0.5 shrink-0" icon="IconBell" size="s" />
              <span>Instaliraj aplikaciju za obavijesti o novim utovarima i istovarima.</span>
            </div>
          )}
          <div className="flex items-start gap-1.5 text-warning">
            <Icon className="mt-0.5 shrink-0" icon="IconInfoCircle" size="s" />
            <span>Ako je već imaš (a traži te ponovnu prijavu), obriši je i dodaj ponovno.</span>
          </div>
        </div>
      </Alert>
    </div>
  );
};
