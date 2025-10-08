import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface NotificationMessage {
  type: 'notification-received';
  data: {
    shipmentId: string;
  };
  timestamp: number;
}

export function useNotificationUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel is not supported in this browser');
      return;
    }

    const channel = new BroadcastChannel('cargo-navis-notifications');

    const handleMessage = (event: MessageEvent<NotificationMessage>) => {
      if (event.data.type === 'notification-received') {
        console.log('Received notification update from service worker:', event.data);

        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['shipment', event.data.data.shipmentId] });
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [queryClient]);
}
