// Sube este número cada vez que subas una versión nueva de jj.html
// (yo te aviso el número exacto cada vez que te entregue un cambio)
const CACHE_VERSION = 'jj-v2';

const FILES_TO_CACHE = [
  './jj.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// estrategia "network first": si hay internet, siempre busca la versión más
// nueva; si no hay internet, usa la guardada — así las actualizaciones
// llegan solas la próxima vez que se abra con conexión
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
