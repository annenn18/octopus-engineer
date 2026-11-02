/* Flashcard Anything – offline helper (service worker).
   When you publish a new version of index.html, change VERSION so everyone gets the update. */
const VERSION = 'v2';
const CACHE = 'flashcard-anything-' + VERSION;
const CDN_CACHE = 'flashcard-anything-cdn';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-192.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png', './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('flashcard-anything-') && k !== CACHE && k !== CDN_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                       // uploads, logins, saving: always online
  const url = new URL(req.url);

  // The app page itself: try the network first (to get updates), fall back to the saved copy when offline
  if (url.origin === self.location.origin && (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'))) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
        return res;
      }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Icons and the manifest: saved copy first
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })));
    return;
  }

  // The extra PDF reader (pdf.js, pinned version on jsDelivr): keep a copy so it also works offline later
  if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.startsWith('/npm/pdfjs-dist@')) {
    event.respondWith(caches.open(CDN_CACHE).then((c) => c.match(req).then((r) => r || fetch(req).then((res) => {
      if (res && res.ok) c.put(req, res.clone());
      return res;
    }))));
    return;
  }
  // Everything else (Supabase accounts and files) goes straight to the network and is never cached.
});
