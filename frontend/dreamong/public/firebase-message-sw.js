self.importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
);

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

// Workbox 초기화 함수 (필요한 경우)
// function initializeWorkbox() {
//   if (typeof workbox !== 'undefined') {
//     console.log('Workbox is loaded');
// workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
//     // 추가적인 Workbox 설정...
//   } else {
//     console.log('Workbox could not be loaded. No offline support');
//   }
// }

// 서비스 워커 설치 이벤트
self.addEventListener('install', (event) => {
  const messaging = initializeFirebase();
  messaging.onBackgroundMessage(handleBackgroundMessage);
  initializeWorkbox();
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

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/oauth2/authorization/google')) {
    return;
  }
  if (event.request.url.includes('/api/oauth2/authorization/naver')) {
    return;
  }
  if (event.request.url.includes('/api/oauth2/authorization/kakao')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('offline.html').then((response) => response || caches.match('index.html'));
      }),
    );
  }
});
