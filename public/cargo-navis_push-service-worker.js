console.log('SERVICE WORKER LOADED');

self.addEventListener('install', (event) => {
  console.group('INSTALL LISTENER');
  console.log('SERVICE WORKER INSTALLED');
  console.log(event);
  console.groupEnd();
});

self.addEventListener('activate', (event) => {
  console.group('ACTIVATE LISTENER');
  console.log('SERVICE WORKER ACTIVATED');
  console.log(event);
  console.groupEnd();
});

self.addEventListener('push', (event) => {
  // const data = event.data.json();

  console.log('PUSH RECEIVED');
  console.log(event);

  self.registration.showNotification('CargoNavis', {
    body: 'This is a test notification',
    icon: '/cargo-navis-logo.png',
    data: { url: 'http://localhost:3000/dashboard' }, // Tenant-specific URL
  });

  // self.registration.showNotification(data.title, {
  //   body: data.body,
  //   icon: '/cargo-navis-logo.png',
  //   data: { url: data.url }, // Tenant-specific URL
  // });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
