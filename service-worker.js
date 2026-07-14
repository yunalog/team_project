const CACHE_VERSION = "game-company-grow-v8";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;

const APP_SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./js/01-data.js",
  "./js/02-core.js",
  "./js/03-battle.js",
  "./js/04-recruits-company.js",
  "./js/05-equipment-growth.js",
  "./js/06-ui-render.js",
  "./js/firebase.js",
  "./assets/player.svg",
  "./assets/enemy.svg",
  "./Resource/UI/Title_Image.png",
  "./Resource/Icon/icon-192.png",
  "./Resource/Icon/icon-512.png"
];

const NETWORK_ONLY_HOSTS = [
  "firebaseapp.com",
  "firebaseio.com",
  "firebase.googleapis.com",
  "firebasestorage.app",
  "gstatic.com",
  "googleapis.com",
  "google.com",
  "googleusercontent.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "cdn.jsdelivr.net"
];

function shouldUseNetworkOnly(request) {
  if (request.method !== "GET") return true;

  const url = new URL(request.url);
  return NETWORK_ONLY_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== APP_SHELL_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (shouldUseNetworkOnly(request)) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        const url = new URL(request.url);
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
