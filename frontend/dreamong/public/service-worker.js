// Service Worker 초기화 및 주요 기능 설정
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Firebase 스크립트 로드
      // - 목적: Firebase 앱과 메시징 서비스 사용
      // - 주의: 버전 번호 확인 필요
      self.importScripts(
        'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
      ),
      // Workbox 모듈 동적 임포트
      // - 용도: 서비스 워커 기능 구현 (캐싱, 라우팅 등)
      import('workbox-precaching'),
      import('workbox-routing'),
      import('workbox-strategies'),
      import('workbox-cacheable-response'),
      import('workbox-expiration'),
    ]).then(([, workboxPrecaching, workboxRouting, workboxStrategies, workboxCacheableResponse, workboxExpiration]) => {
      // Firebase 초기화
      // - 주의: 실제 프로젝트 설정 값으로 교체 필요
      firebase.initializeApp({
        apiKey: 'AIzaSyAPkkOxw23lySY4LsWLbf4nHxHleJ4PewU',
        authDomain: 'pushtest-55dcd.firebaseapp.com',
        projectId: 'pushtest-55dcd',
        storageBucket: 'pushtest-55dcd.appspot.com',
        messagingSenderId: '388920662007',
        appId: '1:388920662007:web:1f49d85f88eb59e8b0c0f2',
        measurementId: 'G-GCKR1QM8EL',
      });

      // Firebase 메시징 인스턴스 생성
      const messaging = firebase.messaging();

      // 백그라운드 메시지 핸들러
      // - 역할: 앱 백그라운드 상태에서 FCM 메시지 처리
      // - 동작:
      //   1. 메시지 수신 로그
      //   2. 알림 제목과 내용 추출
      //   3. 푸시 알림 표시
      messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
          body: payload.notification.body,
          icon: '/drea-mong_192px.png',
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
      });

      // Workbox 기능 구현
      const { precacheAndRoute, createHandlerBoundToURL } = workboxPrecaching;
      const { registerRoute, NavigationRoute } = workboxRouting;
      const { StaleWhileRevalidate, CacheFirst, NetworkFirst } = workboxStrategies;
      const { CacheableResponsePlugin } = workboxCacheableResponse;
      const { ExpirationPlugin } = workboxExpiration;

      // 정적 자산 사전 캐시 및 라우팅
      // - 대상: index.html 및 Vite 생성 매니페스트
      precacheAndRoute([{ url: '/index.html', revision: null }, ...self.__WB_MANIFEST]);

      // 네비게이션 라우트 처리 (Network First 전략)
      // - 목적: SPA 지원
      // - 동작: 모든 내비게이션 요청을 index.html로 라우팅
      const handler = createHandlerBoundToURL('index.html');
      const navigationRoute = new NavigationRoute(handler, {
        denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      });
      registerRoute(navigationRoute);

      // 자산 캐싱 (Stale While Revalidate 전략)
      // - 대상: CSS, JS, Web Worker 파일
      // - 동작:
      //   1. 캐시된 버전 즉시 반환
      //   2. 백그라운드에서 네트워크 요청으로 캐시 업데이트
      registerRoute(
        ({ request }) =>
          request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
        new StaleWhileRevalidate({
          cacheName: 'assets',
          plugins: [
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
          ],
        }),
      );

      // 이미지 캐싱 (Cache First 전략)
      // - 동작:
      //   1. 캐시 확인
      //   2. 캐시 미스 시 네트워크 요청
      // - 설정:
      //   - 최대 60개 이미지
      //   - 30일 캐시 유지
      registerRoute(
        ({ request }) => request.destination === 'image',
        new CacheFirst({
          cacheName: 'images',
          plugins: [
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
            new ExpirationPlugin({
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
          ],
        }),
      );

      // API 요청 캐싱 (Network First 전략)
      // - 동작:
      //   1. 네트워크 요청 시도
      //   2. 실패 시 캐시된 응답 반환
      // - 설정:
      //   - 최대 50개 응답
      //   - 5분 캐시 유지
      registerRoute(
        ({ url }) => url.pathname.startsWith('/api/'),
        new NetworkFirst({
          cacheName: 'api-responses',
          plugins: [
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
            new ExpirationPlugin({
              maxEntries: 50,
              maxAgeSeconds: 5 * 60,
            }),
          ],
        }),
      );
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
// - 동작:
//   1. 알림 닫기
//   2. click_action URL 또는 기본 URL로 이동
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const baseUrl = self.location.origin;

  const clickAction = event.notification.data?.FCM_MSG?.notification?.click_action;
  const targetUrl = clickAction || baseUrl;

  event.waitUntil(self.clients.openWindow(targetUrl));
});

// 오프라인 페이지 처리
// - 동작:
//   1. 네트워크 요청 실패 시
//   2. offline.html 제공 (없으면 index.html)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('offline.html').then((response) => response || caches.match('index.html'));
      }),
    );
  }
});
