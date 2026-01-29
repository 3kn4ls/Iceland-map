const CACHE_NAME = 'iceland-geo-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles/main.css',
  './styles/sidebar.css',
  './styles/controls.css',
  './styles/modals.css',
  './styles/mobile-overrides.css',
  './src/app.js',
  './src/components/Map.js',
  './src/data/pois.js',
  './src/services/database.js',
  './src/services/routing.js',
  './src/services/export.js',
  './src/utils/helpers.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
