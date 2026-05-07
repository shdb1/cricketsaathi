// CricketSaathi Service Worker — handles background push notifications

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const { title, body, icon, url, player, action } = data;

  const options = {
    body: body || 'Cricket update!',
    icon: icon || '/cricket-icon.png',
    badge: '/cricket-badge.png',
    vibrate: [200, 100, 200],
    tag: `cricket-${player || 'update'}`,
    renotify: true,
    data: { url: url || 'https://cricketsaathi.in', player, action },
    actions: [
      { action: 'view', title: '🏏 Watch Live' },
      { action: 'dismiss', title: '✕ Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title || 'CricketSaathi', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || 'https://cricketsaathi.in';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
