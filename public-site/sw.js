const CACHE = "choir-cleanup-site-v0.1.8";
const SHELL = ["/", "/demo/", "/privacy/", "/terms/", "/404/", "/assets/workbench-640.webp", "/favicon.svg"];
async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  const demo = await cache.match("/demo/");
  if (demo) {
    const html = await demo.text();
    const assets = [...html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)].map((match) => `/demo/${match[1]}`);
    await cache.addAll(assets);
  }
  await self.skipWaiting();
}
self.addEventListener("install", (event) => event.waitUntil(precache()));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; })));
});
