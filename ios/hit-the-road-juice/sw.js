// Bump this revision when replacing any app-shell asset.
const prefix = 'hit-the-road-juice:' + self.registration.scope + ':';
const cacheName = prefix + '2026-11-27-1';
const files = [
  './index.html', './style.css', './routes.js', './app.js', './offline.js',
  './cover.jpg', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'
];
const assetURLs = new Set(files.map(file => new URL(file, self.registration.scope).href));
const appURL = new URL('./index.html', self.registration.scope).href;
const rootURL = new URL('./', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(files.map(file => new Request(new URL(file, self.registration.scope), { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(prefix) && key !== cacheName) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  if (url.href === rootURL) url.href = appURL;
  if (!assetURLs.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(url.href) || fetch(event.request);
  })());
});
