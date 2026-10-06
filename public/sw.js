const CACHE_NAME = 'tom-certo-shell-v0.6.0';
const scopeUrl = new URL(self.registration.scope);
const shellUrl = new URL('./index.html', scopeUrl).toString();
const appShell = [
  new URL('./', scopeUrl).toString(),
  shellUrl,
  new URL('./manifest.webmanifest', scopeUrl).toString(),
  new URL('./icons/icon.svg', scopeUrl).toString(),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(appShell)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('tom-certo-') && key !== CACHE_NAME).map((key) => caches.delete(key)),
  )));
  self.clients.claim();
});

function cacheSuccessfulResponse(request, response) {
  if (response.ok && new URL(request.url).origin === self.location.origin) {
    void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheSuccessfulResponse(request, response))
        .catch(() => caches.match(shellUrl).then((cached) => cached ?? caches.match(new URL('./', scopeUrl).toString()))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).then((response) => cacheSuccessfulResponse(request, response))),
  );
});
