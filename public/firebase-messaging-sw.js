// Native Web Push Service Worker (Zero external CDN imports - 100% reliable on locked screen)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let title = "It's Your Turn!";
  let body = "Please proceed to the counter now.";
  let icon = "/logo.png";

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.notification?.title || payload.data?.title || payload.title || title;
      body = payload.notification?.body || payload.data?.body || payload.body || body;
      icon = payload.notification?.icon || payload.data?.icon || payload.icon || icon;
    } catch (_) {
      try {
        body = event.data.text();
      } catch (_) {}
    }
  }

  const options = {
    body: body,
    icon: icon,
    badge: icon,
    vibrate: [300, 100, 300, 100, 400],
    tag: "turnly-call-alert",
    renotify: true,
    requireInteraction: true,
    data: {
      url: "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
