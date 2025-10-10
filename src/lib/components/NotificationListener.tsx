import { useNotificationUpdates } from '@/lib/hooks';

/**
 * Component that listens for service worker notification updates
 * and triggers React Query invalidations to refresh the app state
 */
export const NotificationListener: React.FC = () => {
  useNotificationUpdates();

  // This component doesn't render anything, it's just for the side effect
  return null;
};
