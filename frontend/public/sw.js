self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || 'HabitVest';
  const body = data.body || 'You have a new notification';
  const url = data.url || '/';
  const options = {
    body,
    icon: '/placeholder-logo.png',
    badge: '/placeholder-logo.png',
    data: { url }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then(windowClients => {
    for (const client of windowClients) {
      if (client.url.includes(url) && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  }));
});
