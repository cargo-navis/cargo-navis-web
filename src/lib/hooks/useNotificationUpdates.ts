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
        // A driver confirmed a stop in the driver portal. It changes the stop, its shipments and their cargo's
        // loadStatus, which shipment lists show and filter on, so everything holding stops or shipments reloads.
        void queryClient.invalidateQueries({ queryKey: ['vehicleStops'], refetchType: 'all' });
        void queryClient.invalidateQueries({ queryKey: ['shipment'], refetchType: 'all' });
        void queryClient.invalidateQueries({ queryKey: ['shipments'], refetchType: 'all' });
        return;
      }

      if (notificationType === 'vehicle_stop_document_uploaded') {
        // Stop documents show on the vehicle stops page and on the shipment page.
        void queryClient.invalidateQueries({ queryKey: ['vehicleStops'], refetchType: 'all' });
        void queryClient.invalidateQueries({ queryKey: ['shipment'], refetchType: 'all' });
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
