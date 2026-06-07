// Progressio PWA – service worker for installability and offline shell
const CACHE_NAME = "progressio-v3";
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/icon-192", "/icon-512"];

// Authed routes hold per-user PII. Their HTML must NEVER be written to the
// shared cache, and stale authed HTML must never be served offline.
const AUTHED_PREFIXES = ["/trainer", "/client", "/profile", "/dashboard"];

function isAuthedPath(url) {
  try {
    const { pathname } = new URL(url);
    return AUTHED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
  } catch {
    return false;
  }
}

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PRECACHE_URLS);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// On logout the client posts { type: "CLEAR_CACHE" }; wipe and re-precache so
// no authed HTML can linger in the cache for the next user on this device.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => precache())
    );
  }
});

// Network-first for navigation, cache as fallback
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    const authed = isAuthedPath(event.request.url);
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache navigations to NON-authed paths (no PII in shared cache).
          if (!authed) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (authed) {
            // Never serve stale authed HTML offline — bounce to login/shell.
            return caches
              .match("/login")
              .then((r) => r || caches.match("/"));
          }
          return caches.match(event.request).then((r) => r || caches.match("/"));
        })
    );
    return;
  }

  // Cache-first for icons and manifest
  if (
    event.request.url.includes("/icon-192") ||
    event.request.url.includes("/icon-512") ||
    event.request.url.includes("/manifest")
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
      )
    );
    return;
  }
});
