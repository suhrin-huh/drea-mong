import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// 푸시 알림 수신 처리
self.addEventListener('push', function(event) {
  event.waitUntil(
    (async () => {
      try {
        if (self.Notification.permission !== 'granted') {
          console.warn('Notification permission not granted');
          return;
        }
        console.dir(event.data)
        const data = event.data ? await event.data.json() : {};
        const options = {
          body: data.body || '새 알림이 있습니다.',
          icon: '/drea-mong_192px.png',
          badge: '/drea-mong_192px.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
          },
          actions: [
            {action: 'explore', title: '자세히 보기'},
            {action: 'close', title: '닫기'},
          ]
        };

        await self.registration.showNotification(data.title || '새 알림', options);
      } catch (error) {
        console.error('Error processing push event:', error);
        console.dir(error)
        await self.registration.showNotification('새 알림', {
          body: '새 메시지가 도착했습니다. 앱을 열어 확인해주세요.',
          icon: '/drea-mong_192px.png'
        });
      }
    })()
  );
});

// 푸시 알림 클릭 처리
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const baseUrl = self.location.origin;  // 동적으로 기본 URL 설정

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow(`${baseUrl}/details`)
    );
  } else if (event.action !== 'close') {
    event.waitUntil(
      self.clients.openWindow(baseUrl)
    );
  }
});

// 푸시 구독 변경 처리
self.addEventListener('pushsubscriptionchange', function(event) {
  const baseUrl = self.location.origin;
  event.waitUntil(
    (async () => {
      try {
        const newSubscription = await self.registration.pushManager.subscribe({userVisibleOnly: true});
        const response = await fetch(`${baseUrl}/api/save-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSubscription)
        });
        if (!response.ok) {
          throw new Error('Failed to send subscription to server');
        }
      } catch (error) {
        console.error('Subscription change error:', error);
      }
    })()
  );
});