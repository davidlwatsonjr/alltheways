/* A new, complete cache is populated before the updated service worker activates.
   These two declarations are replaced with the build's complete local file list. */
const CACHE_REVISION = 'DEV';
const PRECACHE_URLS = [];
const CACHE_PREFIX = 'speakeasy-offline-';
const CACHE_NAME = CACHE_PREFIX + CACHE_REVISION;
const FALLBACK_PAGE = '/index.html';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // If even one required file is missing, installation fails and the previous
    // working service worker remains in control instead of leaving a partial app.
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => (name.startsWith(CACHE_PREFIX) || name.startsWith('speakeasy-app-')) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Prefer the latest page online, but always render our precached app shell
    // on airplane mode, including for home-screen standalone launches.
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME)
            .then(cache => cache.put(FALLBACK_PAGE, copy)).catch(() => {}));
        }
        return response;
      } catch {
        return (await caches.match(FALLBACK_PAGE)) ||
          new Response('SpeakEasy is not cached on this device yet.', {status: 503});
      }
    })());
    return;
  }

  // All Vite bundles, local fonts, manifest, icons and ASL diagrams are precached.
  // Same-origin assets loaded later are cached after the first successful fetch.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME)
          .then(cache => cache.put(request, copy)).catch(() => {}));
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
