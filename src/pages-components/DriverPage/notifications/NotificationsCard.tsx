import clsx from 'clsx';
import { useState } from 'react';

import { showErrorToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, Text } from '@/ui';

import { isIos } from '../install/installHint';
import { isInstalledApp } from '../install/useInstallPrompt';
import type { DriverPushNotificationsStatus } from './useDriverPushNotifications';

// Where to turn notifications back on after the driver blocked them; the browser won't ask again.
function getSettingsHint() {
  if (isIos(navigator.userAgent)) return 'Otvori Postavke → Obavijesti → Cargo Navis i uključi Dopusti obavijesti.';
  if (isInstalledApp()) return 'Uključi ih u Postavke → Aplikacije → Cargo Navis → Obavijesti.';

  return 'U pregledniku otvori postavke stranice (ikona pokraj URL adrese) i dopusti obavijesti.';
}

// Teal invites (brand colour, something good to turn on); orange flags that the driver blocked notifications.
const STATE_STYLES = {
  invite: {
    card: 'border-teal-100 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/40',
    icon: 'text-teal-600 dark:text-teal-300',
    title: 'text-teal-800 dark:text-teal-100',
  },
  denied: {
    card: 'border-orange-100 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/40',
    icon: 'text-orange-500 dark:text-orange-300',
    title: 'text-orange-700 dark:text-orange-200',
  },
} as const;

interface NotificationsCardProps {
  status: DriverPushNotificationsStatus;
  onEnable(): Promise<void>;
}

/** Above the route until the driver allows notifications. Hidden where web push isn't available. */
export const NotificationsCard: React.FC<NotificationsCardProps> = ({ status, onEnable }) => {
  const [isEnabling, setIsEnabling] = useState(false);

  if (status !== 'default' && status !== 'denied') return null;

  async function handleEnable() {
    setIsEnabling(true);
    try {
      await onEnable();
    } catch {
      showErrorToast({ title: 'Uključivanje obavijesti nije uspjelo. Pokušaj ponovno.' });
    } finally {
      setIsEnabling(false);
    }
  }

  const isDenied = status === 'denied';
  const styles = STATE_STYLES[isDenied ? 'denied' : 'invite'];

  return (
    <FlexLayout className="px-4 pb-2">
      <FlexLayout className={clsx('w-full flex-col gap-4 rounded-l border p-4 shadow-sm', styles.card)}>
        <FlexLayout className="flex-col gap-1">
          <FlexLayout className="items-center gap-2">
            <Icon
              className={isDenied ? undefined : 'bell-ring'}
              color={styles.icon}
              icon={isDenied ? 'IconBellOff' : 'IconBellRinging'}
              size="m"
            />
            <Text color={styles.title} variant="text-s-medium">
              {isDenied ? 'Ne primaš obavijesti' : 'Uključi obavijesti'}
            </Text>
          </FlexLayout>
          <Text color="text-color-2" variant="text-xs">
            {isDenied
              ? `Nećemo ti moći javiti za nove postaje. ${getSettingsHint()}`
              : 'Obavijestit ćemo te o svakoj novoj postaji, i kad aplikacija nije otvorena.'}
          </Text>
        </FlexLayout>
        {!isDenied && (
          <Box>
            <Button
              iconLeft="IconBell"
              isFullWidth
              isLoading={isEnabling}
              size="m"
              text="Uključi obavijesti"
              onClick={handleEnable}
            />
          </Box>
        )}
      </FlexLayout>
    </FlexLayout>
  );
};
