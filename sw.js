const CACHE_NAME = "smart-football-fields-v1";
const APP_SHELL = [
  "./", "./index.html", "./field-details.html", "./booking-review.html",
  "./booking-success.html", "./my-bookings.html", "./admin-dashboard.html",
  "./admin-bookings.html", "./irrigation.html", "./fields-pricing.html",
  "./design-system.html", "./user-flows.html", "./css/style.css",
  "./js/script.js", "./js/preferences.js", "./manifest.json",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/icons/logo-1024.png", "./assets/images/og-image-1200x630.jpg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.status === 200) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
