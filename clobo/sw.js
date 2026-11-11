'use strict';
// Cache names include the scope, so even another copy of Clobo stays independent.
const PREFIX = 'clobo-freedom:' + self.registration.scope + ':';
const CACHE = PREFIX + 'v1';
const ASSETS = [
  './index.html', './countdown.js', './app.js', './offline.js',
  './daily-messages.js?v=4', './daily.js?v=4', './identity.webmanifest',
  './identity/identity.css', './identity/icon.svg', './identity/icon-180.png',
  './identity/icon-192.png', './identity/icon-512.png', './chlo-28-days.ics'
].map(path => new URL(path, self.registration.scope).href);
const PAGE = new URL('./index.html', self.registration.scope).href;
const ROOT = new URL('./', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const bare = url.origin + url.pathname;
  // Only app entry routes receive the HTML fallback; never return it for missing files.
  const page = request.mode === 'navigate' && (bare === PAGE || bare === ROOT);
  const asset = ASSETS.find(item => {
    const known = new URL(item);
    return known.origin + known.pathname === bare;
  });
  if (!page && !asset) return;
  // A complete versioned shell stays consistent until the next worker activates.
  event.respondWith(caches.open(CACHE).then(cache => cache.match(page ? PAGE : asset))
    .then(cached => cached || fetch(request)));
});
