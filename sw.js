const CACHE = "fasta-v15";
const PRECACHE = [
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

// Install: precache essential files
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

// Activate: delete old caches, claim clients immediately
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first — always try fresh, fall back to cache (offline)
self.addEventListener("fetch", e => {
  // Only handle same-origin GET requests
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Got fresh response — update cache and return
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // Network failed (offline) — serve from cache
        return caches.match(e.request);
      })
  );
});
