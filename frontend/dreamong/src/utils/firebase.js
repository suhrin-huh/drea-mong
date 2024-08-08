import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

const baseURL = 'http://localhost:8080';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * FCM 토큰을 가져오고 서버로 전송하는 함수
 * @param {Function} setTokenFound - 토큰 상태를 업데이트하는 함수
 */
export const getFCMToken = (setTokenFound) => {
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FB_VIPID_ID,
  })
    .then((currentToken) => {
      if (currentToken) {
        setTokenFound(true);
        console.log('Token: ', currentToken);

        const storedToken = localStorage.getItem('fcmToken');

        if (storedToken !== currentToken) {
          axios({
            method: 'post',
            url: `${baseURL}/users/fcm-token`,
            data: { token: currentToken },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          })
            .then((response) => {
              if (response.status === 200) {
                console.log('Token sent to server successfully.');
                localStorage.setItem('fcmToken', currentToken);
              } else {
                console.error('Failed to send token to server.');
              }
            })
            .catch((error) => {
              console.error('Error sending token to server: ', error);
            });
        } else {
          console.log('Token already sent to server.');
        }
      } else {
        console.log('No registration token available. Request permission to generate one.');
        setTokenFound(false);
      }
    })
    .catch((err) => {
      console.error('An error occurred while retrieving token: ', err);

      if (err.code === 'messaging/permission-blocked') {
        console.error('Notification permission was blocked.');
      } else {
        console.error('An error occurred while retrieving token: ', err);
      }

      setTokenFound(false);
    });
};

/**
 * FCM 메시지 수신 리스너 설정
 * @returns {Promise} 메시지 수신 프라미스
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
