import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import axios from 'axios';

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

let messaging;

// FCM 지원 여부 확인 및 메시징 객체 초기화
const initializeMessaging = async () => {
  try {
    if (await isSupported()) {
      messaging = getMessaging(app);
      console.log('FCM is supported');
      return true;
    }
    console.log('FCM is not supported');
    return false;
  } catch (error) {
    console.error('FCM initialization error', error);
    return false;
  }
};

// FCM 토큰 가져오기
export const getFCMToken = async () => {
  if (!messaging) {
    const isInitialized = await initializeMessaging();
    if (!isInitialized) return null;
  }

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: '',
    });
    if (currentToken) {
      console.log('FCM token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token.', err);
    return null;
  }
};

// 토픽 구독
export const subscribeToTopic = async (token, topic) => {
  try {
    const response = await axios({
      method: 'post',
      url: `https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`,
      headers: {
        Authorization: `key=sample`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Subscribed to ${topic}`);
    return true;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return false;
  }
};

// 토픽 구독 해제
export const unsubscribeFromTopic = async (token, topic) => {
  try {
    const response = await axios({
      method: 'delete',
      url: `https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`,
      headers: {
        Authorization: `key=sample`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Unsubscribed from ${topic}`);
    return true;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    return false;
  }
};
