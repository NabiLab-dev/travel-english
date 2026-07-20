// 오프라인 지원 (여행지에서 와이파이 없어도 배운 문장은 들을 수 있게)
// app.js, style.css 등을 고치고 새로 배포했는데 반영이 안 되면 CACHE_NAME 숫자를 올리세요.
const CACHE_NAME = "travel-eng-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./img/icon-192.png",
  "./img/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin) return;

  // 음원: 한 번 들으면 계속 오프라인에서도 재생되도록 캐시 우선
  if (url.pathname.indexOf("/audio/") !== -1) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (res) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          return res;
        });
      })
    );
    return;
  }

  // 앱 화면(HTML/CSS/JS): 최신 내용이 먼저, 오프라인일 때만 캐시로 대체
  event.respondWith(
    fetch(event.request)
      .then(function (res) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return res;
      })
      .catch(function () { return caches.match(event.request); })
  );
});
