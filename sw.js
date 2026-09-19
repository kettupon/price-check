// Keep the installable app controlled while requests use the browser's normal
// network behavior. The live price feed requires Firebase connectivity.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
