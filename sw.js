const CACHE_NAME = "ttpa-offline-v1";
const OFFLINE_URL = new URL(
    "offline.html",
    self.registration.scope
).href;

// Save the offline message on installation.
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            const response = await fetch(OFFLINE_URL, {
                cache: "reload"
            });

            if (!response.ok) {
                throw new Error("Could not load offline.html");
            }

            await cache.put(OFFLINE_URL, response);
        })
    );
});

// Begin handling pages after activation.
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Try the internet first; show the message if it fails.
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    if (
        event.request.method !== "GET" ||
        event.request.mode !== "navigate" ||
        url.origin !== self.location.origin ||
        !url.href.startsWith(self.registration.scope)
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(async () => {
            const cache = await caches.open(CACHE_NAME);
            const offlinePage = await cache.match(OFFLINE_URL);

            return offlinePage || new Response(
                "You are offline. Please reconnect to the internet.",
                {
                    status: 503,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8"
                    }
                }
            );
        })
    );
});