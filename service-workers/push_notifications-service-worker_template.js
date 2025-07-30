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
      const title = `CargoNavis - Nalog prihvaćen`;
      const message = `Vozač ${data.metadata.driverName} je prihvatio nalog ${data.metadata.orderNumber}`;
      const targetUrl = getShipmentUrl(data.metadata.shipmentId);

      return { title, message, targetUrl };
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
