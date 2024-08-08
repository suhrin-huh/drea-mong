// Firebase 앱 초기화 함수
function initializeFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: import.meta.env.VITE_FB_API_KEY,
      authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FB_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FB_APP_ID,
      measurementId: import.meta.env.VITE_MEASUREMENT_ID,
    });
  }
  return firebase.messaging();
}

// 백그라운드 메시지 처리 함수
function handleBackgroundMessage(payload) {
  console.log('[service-worker.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/drea-mong_192px.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}

// Workbox 초기화 및 설정 함수
function initializeWorkbox() {
  if (typeof workbox !== 'undefined') {
    workbox.precaching.precacheAndRoute([{ url: '/index.html', revision: null }, ...self.__WB_MANIFEST]);

    const handler = workbox.precaching.createHandlerBoundToURL('index.html');
    const navigationRoute = new workbox.routing.NavigationRoute(handler, {
      denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
    });
    workbox.routing.registerRoute(navigationRoute);

    workbox.routing.registerRoute(
      ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'assets',
        plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })],
      }),
    );

    workbox.routing.registerRoute(
      ({ request }) => request.destination === 'image',
      new workbox.strategies.CacheFirst({
        cacheName: 'images',
        plugins: [
          new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
          new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
      }),
    );

    workbox.routing.registerRoute(
      ({ url }) => url.pathname.startsWith('/api/'),
      new workbox.strategies.NetworkFirst({
        cacheName: 'api-responses',
        plugins: [
          new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
          new workbox.expiration.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
        ],
      }),
    );
  } else {
    console.error('Workbox could not be loaded. No offline support');
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      self.importScripts(
        'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
        'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js',
      ),
    ]).then(() => {
      const messaging = initializeFirebase();
      messaging.onBackgroundMessage(handleBackgroundMessage);
      initializeWorkbox();
    }),
  );
});

// 서비스 워커 업데이트 메시지 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 푸시 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const baseUrl = self.location.origin;
  const clickAction = event.notification.data?.FCM_MSG?.notification?.click_action;
  const targetUrl = clickAction || baseUrl;

  event.waitUntil(self.clients.openWindow(targetUrl));
});

// 오프라인 페이지 처리
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('offline.html').then((response) => response || caches.match('index.html'));
      }),
    );
  }
});
