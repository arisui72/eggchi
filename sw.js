const VERSION = "v2";
const STATIC_CACHE = `eggchi-static-${VERSION}`;
const RUNTIME_CACHE = `eggchi-runtime-${VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );

      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  event.respondWith(handleAssetRequest(request));
});

async function handleNavigationRequest(event) {
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      runtimeCache.put("./index.html", preload.clone());
      return preload;
    }

    const fresh = await fetch(event.request);
    const runtimeCache = await caches.open(RUNTIME_CACHE);
    runtimeCache.put("./index.html", fresh.clone());
    return fresh;
  } catch {
    const cached =
      (await caches.match("./index.html")) || (await caches.match("./"));
    if (cached) {
      return cached;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function handleAssetRequest(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return caches.match("./index.html");
}
