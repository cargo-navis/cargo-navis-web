console.info('Push notifications - Service worker loaded');

const ENV_VARS = {
  appUrl: '__APP_URL__',
};

self.addEventListener('push', (event) => {
  console.log('PUSH RECEIVED');
  console.log(event);

  try {
    const notificationData = event.data.json();
    const { title, message, targetUrl } = extractNotificationData(notificationData);
    dispatchNotification(title, message, targetUrl);
  } catch (error) {
    console.log('ERROR DISPATCHING NOTIFICATION');
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
    default:
      throw new Error('Unsupported notification type');
  }
}

function getShipmentUrl(shipmentId) {
  const appUrl = ENV_VARS.appUrl;
  return `${appUrl}/dashboard/shipments/${shipmentId}`;
}

function dispatchNotification(title, message, targetUrl) {
  self.registration.showNotification(title, {
    body: message,
    icon: '/logomark.png',
    data: { url: `${targetUrl}` },
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
