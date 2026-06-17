console.info('Push notifications - Service worker loaded');

const ENV_VARS = {
  appUrl: '__APP_URL__',
};

self.addEventListener('install', () => {
  console.log('Service worker update installing...');
  self.skipWaiting();
});

self.addEventListener('push', (event) => {
  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.error('[SW] Failed to parse push payload', e);
    return;
  }
  console.log('[SW] PUSH RECEIVED', notificationData);

  try {
    broadcastNotification(notificationData);
  } catch (e) {
    console.error('[SW] broadcast failed', e);
  }

  try {
    const { title, message, targetUrl } = extractNotificationData(notificationData);
    dispatchNotification(title, message, targetUrl);
  } catch (error) {
    console.log('[SW] ERROR DISPATCHING NOTIFICATION');
    console.error(error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

function extractNotificationData(data) {
  switch (data.type) {
    case 'shipment_message_accepted': {
      return getShipmentAcceptedNotifData(data);
    }
    case 'shipment_status_changed': {
      return getShipmentStatusChangedNotifData(data);
    }
    case 'vehicle_stop_completed': {
      return getVehicleStopCompletedNotifData(data);
    }
    case 'shipment_draft_updated': {
      return getShipmentDraftUpdatedNotifData(data);
    }
    default:
      throw new Error('Unsupported notification type');
  }
}

function getShipmentUrl(shipmentId) {
  const appUrl = ENV_VARS.appUrl;
  return `${appUrl}/dashboard/shipments/${shipmentId}`;
}

function getShipmentDraftsUrl(draftId) {
  const appUrl = ENV_VARS.appUrl;
  const highlight = draftId ? `&highlight=${draftId}` : '';
  return `${appUrl}/dashboard/shipments?tab=drafts${highlight}`;
}

function dispatchNotification(title, message, targetUrl) {
  self.registration.showNotification(title, {
    body: message,
    icon: '/logomark.png',
    data: { url: `${targetUrl}` },
  });
}

function broadcastNotification(notification) {
  const channel = new BroadcastChannel('cargo-navis-notifications');
  channel.postMessage({
    type: 'notification-received',
    data: {
      notificationType: notification.type,
      metadata: notification.metadata,
    },
    timestamp: Date.now(),
  });
}

function getShipmentAcceptedNotifData(data) {
  const { orderNumber, driverName, shipmentId } = data.metadata;

  const title = `CargoNavis - Nalog prihvaćen`;
  const message = `${driverName} je prihvatio nalog ${orderNumber}`;
  const targetUrl = getShipmentUrl(shipmentId);

  return { title, message, targetUrl };
}

function getShipmentStatusChangedNotifData(data) {
  const { orderNumber, driverName, shipmentId, newStatus } = data.metadata;

  const isShipmentLoaded = newStatus === 'loaded';
  const newShipmentStatus = isShipmentLoaded ? 'utovaren' : 'istovaren';

  const statusText = isShipmentLoaded ? 'utovario' : 'istovario';

  const title = `CargoNavis - Nalog ${newShipmentStatus}`;
  const message = `${driverName} je ${statusText} nalog ${orderNumber}`;
  const targetUrl = getShipmentUrl(shipmentId);

  return { title, message, targetUrl };
}

function getShipmentDraftUpdatedNotifData(data) {
  const { draftId, fileName } = data.metadata;

  const title = `CargoNavis - Nalog obrađen`;
  const message = fileName
    ? `Obrađeni nalog "${fileName}" je spreman za pregled`
    : 'Obrađeni nalog je spreman za pregled';
  const targetUrl = getShipmentDraftsUrl(draftId);

  return { title, message, targetUrl };
}

function getVehicleStopCompletedNotifData(data) {
  const { driverName, address, shipments = [] } = data.metadata;

  const orderList = shipments.map((s) => s.orderNumber).join(', ');
  const orderLabel = shipments.length === 1 ? 'nalog' : 'naloge';

  const title = `CargoNavis - Stanica obavljena`;
  const message = `${driverName} je obavio stanicu (${address})${orderList ? ` za ${orderLabel} ${orderList}` : ''}`;
  const firstShipmentId = shipments[0]?.shipmentId;
  const targetUrl = firstShipmentId ? getShipmentUrl(firstShipmentId) : `${ENV_VARS.appUrl}/dashboard`;

  return { title, message, targetUrl };
}
