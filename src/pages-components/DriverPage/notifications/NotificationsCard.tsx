import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { isIos } from '../install/installHint';
import { isInstalledApp } from '../install/useInstallPrompt';
import type { DriverPushNotificationsStatus } from './useDriverPushNotifications';

// Where to turn notifications back on after the driver blocked them; the browser won't ask again.
function getSettingsHint() {
  if (isIos(navigator.userAgent)) return 'Otvori Postavke → Obavijesti → Cargo Navis i uključi Dopusti obavijesti.';
  if (isInstalledApp()) return 'Uključi ih u Postavke → Aplikacije → Cargo Navis → Obavijesti.';

  return 'U pregledniku otvori postavke stranice (ikonica pokraj URL adrese) i dopusti obavijesti.';
}

interface NotificationsCardProps {
  status: DriverPushNotificationsStatus;
  onEnable(): Promise<NotificationPermission>;
}

/**
 * Above the route until the driver allows notifications (brand tint, something good to turn on); a warning once they
 * blocked them. Hidden where web push isn't available.
 */
export const NotificationsCard: React.FC<NotificationsCardProps> = ({ status, onEnable }) => {
  const [isEnabling, setIsEnabling] = useState(false);

  if (status !== 'default' && status !== 'denied') return null;

  async function handleEnable() {
    setIsEnabling(true);
    try {
      const permission = await onEnable();
      if (permission === 'granted') {
        showSuccessToast({
          title: 'Obavijesti su uključene',
          description: 'Javit ćemo ti kad stigne novi nalog.',
        });
      }
    } catch {
      showErrorToast({ title: 'Uključivanje obavijesti nije uspjelo', description: 'Pokušaj ponovno.' });
    } finally {
      setIsEnabling(false);
    }
  }

  if (status === 'denied') {
    return (
      <div className="px-4 pb-2">
        <Alert icon="IconBellOff" variant="warning">
          <AlertTitle>Ne primaš obavijesti</AlertTitle>
          <AlertDescription>Nećemo ti moći javiti za nove naloge. {getSettingsHint()}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="mx-4 mb-2 gap-3 border border-primary/15 bg-brand-soft p-4 ring-0 dark:border-primary">
      <div className="flex items-start gap-3">
        <Icon className="bell-ring mt-0.5 shrink-0 text-brand" icon="IconBell" size="m" />
        <div className="flex grow flex-col gap-1">
          <span className="font-medium text-primary dark:text-foreground">Uključi obavijesti</span>
          <span className="text-sm text-muted-foreground">Javit ćemo ti kad ti se dodijele novi nalozi.</span>
        </div>
      </div>
      <Button className="w-full" loading={isEnabling} size="xl" onClick={() => void handleEnable()}>
        <Icon data-icon="inline-start" icon="IconBell" size="m" />
        {isEnabling ? 'Uključujem…' : 'Uključi obavijesti'}
      </Button>
    </Card>
  );
};
