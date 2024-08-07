import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase 설정
// 주의: 실제 값들은 환경 변수나 설정 파일에서 가져와야 합니다.
const firebaseConfig = {
  apiKey: 'AIzaSyAPkkOxw23lySY4LsWLbf4nHxHleJ4PewU',
  authDomain: 'pushtest-55dcd.firebaseapp.com',
  projectId: 'pushtest-55dcd',
  storageBucket: 'pushtest-55dcd.appspot.com',
  messagingSenderId: '388920662007',
  appId: '1:388920662007:web:1f49d85f88eb59e8b0c0f2',
  measurementId: 'G-GCKR1QM8EL',
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * FCM 토큰을 가져오고 서버로 전송하는 함수
 * @returns {Promise<string>} FCM 토큰
 */
export const getFCMToken = () => {
  return getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' })
    .then((currentToken) => {
      if (currentToken) {
        // 토큰을 서버로 전송하는 로직
        // TODO: API 호출로 변경 필요
        console.log('FCM 토큰:', currentToken);
        return currentToken;
      } else {
        console.log('FCM 토큰을 가져올 수 없습니다.');
        return null;
      }
    })
    .catch((err) => {
      console.error('FCM 토큰 가져오기 오류:', err);
      return null;
    });
};

/**
 * 푸시 메시지 수신 리스너 설정
 * @param {Function} callback 메시지 수신 시 실행할 콜백 함수
 */
export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('메시지 수신:', payload);
    callback(payload);
  });
};
