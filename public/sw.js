const CACHE = 'alltheways-app-v1';
const ART_CACHE = 'alltheways-asl-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];
const ASL_SOURCE = 'https://raw.githubusercontent.com/luthfidi/spellhand/5a4e1fa8b13be9cba2262a10914e58f2ca3d6fab/public/letters/asl/';
const LETTERS = 'abcdefghiklmnopqrstuvwxy'.split(''); // J and Z require motion.
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => ![CACHE, ART_CACHE].includes(key)).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
  // Best-effort offline priming: external artwork must never block deployment.
  event.waitUntil(caches.open(ART_CACHE).then(async cache => {
    await Promise.allSettled(LETTERS.map(async letter => {
      const request = new Request(`${ASL_SOURCE}${letter}.svg`, {mode: 'no-cors'});
      if (await cache.match(request)) return;
      const response = await fetch(request);
      await cache.put(request, response);
    }));
  }));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.href.startsWith(ASL_SOURCE)) {
    event.respondWith(caches.open(ART_CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
      return response;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => response).catch(() => caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(async cached => {
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return Response.error();
    }
  }));
});
