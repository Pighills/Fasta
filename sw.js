const CACHE = "fasta-v10";
const FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/styles.css",
  "/js/app.js",
  "/js/data.js",
  "/js/state.js",
  "/js/helpers.js",
  "/js/modals.js",
  "/js/actions.js",
  "/js/ui.js",
  "/js/views/timer.js",
  "/js/views/learn.js",
  "/js/views/history.js",
  "/js/views/profile.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
