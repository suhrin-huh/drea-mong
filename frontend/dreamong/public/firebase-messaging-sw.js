self.importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
);

// Firebase 앱 초기화 함수
function initializeFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: 'AIzaSyA235r3rrXeSNznE0LnIWfZqF4bVXPk4Qs',
      authDomain: 'drea-mong.firebaseapp.com',
      projectId: 'drea-mong',
      storageBucket: 'drea-mong.appspot.com',
      messagingSenderId: '299128370529',
      appId: '1:299128370529:web:cc4cbe81ebe8c3e0b4c120',
    });
  }
  return firebase.messaging();
}

// 백그라운드 메시지 처리 함수
function handleBackgroundMessage(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/drea-mong_192px.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}

// 서비스 워커 설치 이벤트
self.addEventListener('install', (event) => {
  const messaging = initializeFirebase();
  messaging.onBackgroundMessage(handleBackgroundMessage);
});

// 푸시 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const baseUrl = self.location.origin;
  const clickAction = event.notification.data?.FCM_MSG?.notification?.click_action;
  const targetUrl = clickAction || baseUrl;

  event.waitUntil(self.clients.openWindow(targetUrl));
});

// 기본적인 오프라인 페이지 처리
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('offline.html').then((response) => response || caches.match('index.html'));
      }),
    );
  }
});
