const CACHE = 'spark-v3';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg',
  'icon-maskable.svg',
  'data/prompts/index.json',
  'data/prompts/mine.json',
  'data/prompts/oblique-strategies.json',
  'data/prompts/tarot.json',
  'data/prompts/samples.json',
  'images/sunrise.svg',
  'images/blank-space.svg',
  'images/compass.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
