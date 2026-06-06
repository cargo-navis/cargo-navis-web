import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface NotificationMessage {
  type: 'notification-received';
  data: {
    notificationType: string;
    metadata: {
      vehicleStopId?: string;
      shipments?: { shipmentId: string; orderNumber: string }[];
      draftId?: string;
      fileName?: string;
    };
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
      if (event.data.type !== 'notification-received') return;

      console.log('[useNotificationUpdates] Received broadcast:', event.data);

      const { notificationType, metadata } = event.data.data;

      queryClient.refetchQueries({ queryKey: ['notifications'], type: 'all' });

      if (notificationType === 'vehicle_stop_completed') {
        const cache = queryClient.getQueryCache();
        const vehicleStopsQueries = cache.findAll({ queryKey: ['vehicleStops'] });

        const keysToRevalidate = vehicleStopsQueries.map((q) => q.queryKey);
        console.log(
          '[useNotificationUpdates] vehicle_stop_completed - matched vehicleStops queries:',
          keysToRevalidate
        );

        vehicleStopsQueries.forEach((q) => {
          void queryClient.refetchQueries({ queryKey: q.queryKey, exact: true, type: 'all' });
        });

        metadata.shipments?.forEach((s) => {
          console.log('[useNotificationUpdates] refetching shipment', s.shipmentId);
          void queryClient.refetchQueries({ queryKey: ['shipment', s.shipmentId], exact: true, type: 'all' });
        });

        return;
      }

      if (notificationType === 'shipment_draft_updated') {
        void queryClient.invalidateQueries({ queryKey: ['shipment-drafts'] });
        if (metadata.draftId) {
          void queryClient.invalidateQueries({ queryKey: ['shipment-draft', metadata.draftId] });
        }
        return;
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [queryClient]);
}
