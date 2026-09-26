const CACHE = "fasta-v39";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./css/fonts.css",
  "./fonts/outfit-latin.woff2",
  "./js/app.js",
  "./js/data.js",
  "./js/state.js",
  "./js/migrations.js",
  "./js/helpers.js",
  "./js/modals.js",
  "./js/actions.js",
  "./js/ui.js",
  "./js/backup.js",
  "./js/program.js",
  "./js/views/timer.js",
  "./js/views/learn.js",
  "./js/views/history.js",
  "./js/views/profile.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
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

// Resolve against the worker so installation in a subdirectory also works.
const PRECACHE_URLS = new Set(PRECACHE.map(path => new URL(path, self.location.href).href));
const START_URL = new URL('./', self.location.href).href;
const NETWORK_TIMEOUT_MS = 3000;

async function cachedResponse(request) {
  try {
    if (request.mode === 'navigate') {
      return await caches.match(request, { ignoreSearch: true }) || await caches.match(START_URL);
    }
    return await caches.match(request);
  } catch {
    return undefined;
  }
}

// Network-first, with a bounded wait when an offline copy is available.
self.addEventListener("fetch", e => {
  const request = e.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigation query parameters must not create additional cache entries.
  if (request.mode === 'navigate') url.search = '';
  const cacheKey = url.href;
  const network = fetch(request);

  // Register the entire cache update while the fetch event is still active.
  // A full/unavailable cache must not prevent delivery of a network response.
  e.waitUntil(network.then(async response => {
    if (response.ok && response.type === 'basic' && PRECACHE_URLS.has(cacheKey)) {
      const copy = response.clone();
      const cache = await caches.open(CACHE);
      await cache.put(cacheKey, copy);
    }
  }).catch(() => {}));

  e.respondWith((async () => {
    let timer;
    const timeout = new Promise(resolve => {
      timer = setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS);
    });
    try {
      const response = await Promise.race([network, timeout]);
      if (response) return response;
      const cached = await cachedResponse(request);
      return cached || await network;
    } catch {
      return await cachedResponse(request) || Response.error();
    } finally {
      clearTimeout(timer);
    }
  })());
});
