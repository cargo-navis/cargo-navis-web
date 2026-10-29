import { useEffect, useRef } from 'react';

// Sent by public/driver-sw.js; keep the strings in sync.
const MESSAGE_STOPS_CHANGED = 'driver-stops-changed';
const MESSAGE_OPEN_SHIPMENT = 'driver-open-shipment';

type ServiceWorkerMessage =
  | { type: typeof MESSAGE_STOPS_CHANGED }
  | { type: typeof MESSAGE_OPEN_SHIPMENT; shipmentId: string };

interface ServiceWorkerMessageHandlers {
  /** A push arrived while the app is open (e.g. new stops assigned). */
  onStopsChanged(): void;
  /** The driver tapped a notification while the app was open. */
  onOpenShipment(shipmentId: string): void;
}

export function useServiceWorkerMessages(handlers: ServiceWorkerMessageHandlers) {
  // Latest handlers without re-subscribing on every render.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    function handleMessage(event: MessageEvent<ServiceWorkerMessage>) {
      const message = event.data;
      if (message?.type === MESSAGE_STOPS_CHANGED) handlersRef.current.onStopsChanged();
      if (message?.type === MESSAGE_OPEN_SHIPMENT) handlersRef.current.onOpenShipment(message.shipmentId);
    }

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);
}
