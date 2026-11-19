self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (x) { p = { data: { corpo: e.data ? e.data.text() : '' } }; }
  const d = p.data || {}, n = p.notification || {};
  const titulo = d.titulo || n.title || 'Respostas SAC';
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.corpo || n.body || '',
    icon: 'BaseResposta.png',
    badge: 'BaseResposta.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    requireInteraction: true,
    data: { url: d.url || './?abrir=sugestoes' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './?abrir=sugestoes', self.registration.scope).href;
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of abertas) {
      if (c.url.startsWith(self.registration.scope)) { await c.focus(); c.postMessage({ abrir: 'sugestoes' }); return; }
    }
    await self.clients.openWindow(url);
  })());
});
