import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Button from '../../components/Button';
import { useNavigate, Outlet } from 'react-router-dom';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { baseURLState } from '../../recoil/atoms';

import back from '../../assets/back.svg';

// Make sure to set the app element for accessibility
Modal.setAppElement('#root');

const StreamingPage = () => {
  const navigate = useNavigate();
  const baseURL = useRecoilValue(baseURLState);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContentVisible, setModalContentVisible] = useState(false);
  const [sleepTime, setSleepTime] = useState(sessionStorage.getItem('sleepTime') || null);
  const [fcmToken, setFcmToken] = useState(localStorage.getItem('fcmToken') || null);

  // 취침 시간 설정 관련 useEffect
  useEffect(() => {
    let intervalId;

    // sleepTime이 존재할 때만 취침 시간 체크 인터벌 설정
    if (sleepTime) {
      intervalId = setInterval(checkSleepTime, 10000); // 10초마다 체크
    }

    // localStorage의 sleepTime 변경 감지
    const handleStorageChange = (event) => {
      if (event.key === 'sleepTime') {
        const updatedSleepTime = localStorage.getItem('sleepTime');
        setSleepTime(updatedSleepTime);

        // 인터벌 초기화
        if (intervalId) {
          clearInterval(intervalId);
        }
        if (updatedSleepTime) {
          intervalId = setInterval(checkSleepTime, 10000); // 10초 간격으로 확인
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // FCM 토큰 확인 및 갱신
    checkAndRefreshFCMToken();

    // 포그라운드 메시지 수신 리스너 설정
    const messaging = getMessaging();
    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log('Received foreground message ', payload);
        // 여기에 포그라운드 메시지 처리 로직 추가
      })
      .catch((err) => console.log('Failed to receive message: ', err));

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('storage', handleStorageChange);

      // 컴포넌트 언마운트 시 리스너 해제
      unsubscribe.then((f) => f()).catch((err) => console.log('Error unsubscribing: ', err));
    };
  }, [sleepTime]);

  const checkAndRefreshFCMToken = async () => {
    const messaging = getMessaging();
    try {
      const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FB_VAPID_ID });
      if (currentToken && currentToken !== fcmToken) {
        setFcmToken(currentToken);
        localStorage.setItem('fcmToken', currentToken);
        // 서버에 새 토큰 전송
        sendTokenToServer(currentToken);
      } else if (!currentToken) {
        console.log('FCM 토큰을 가져올 수 없습니다. 권한을 확인하세요.');
      }
    } catch (error) {
      console.error('FCM 토큰 가져오기 오류:', error);
    }
  };

  const sendTokenToServer = (token) => {
    axios({
      method: 'post',
      url: `${baseURL}/update-fcm-token`,
      data: { token },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        console.log('토큰이 서버에 성공적으로 전송되었습니다.');
      })
      .catch((error) => {
        console.error('토큰 서버 전송 실패:', error);
      });
  };

  // 취침 시간 체크 함수
  const checkSleepTime = () => {
    if (!sleepTime) return; // sleepTime이 null이면 함수 종료

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (currentTime === sleepTime) {
      sendFCMMessage();
      navigate('/'); // 루트 URL로 이동
    }
  };

  const sendFCMMessage = () => {
    if (!fcmToken) {
      console.error('FCM 토큰이 없습니다.');
      return;
    }

    axios({
      method: 'post',
      url: `${baseURL}/send-fcm`,
      data: {
        token: fcmToken,
        title: '취침 시간 알림',
        body: '설정하신 취침 시간이 되었습니다. 좋은 꿈 꾸세요!',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        console.log('FCM 메시지 전송 성공:', response.data);
      })
      .catch((error) => {
        console.error('FCM 메시지 전송 실패:', error);
      });
  };

  const toggleModalIsOpen = () => {
    if (!modalIsOpen) {
      setModalIsOpen(true);
      setTimeout(() => setModalContentVisible(true), 50);
    } else {
      setModalContentVisible(false);
      setTimeout(() => setModalIsOpen(false), 300);
    }
  };

  const handleSleepTimeSave = (event) => {
    event.preventDefault();
    const setTime = event.target.elements.sleepTime.value;
    setSleepTime(setTime);

    const [hours, mins] = setTime.split(':').map(Number);
    const now = new Date();
    const nowHours = now.getHours();
    const nowMins = now.getMinutes();

    // 시간 차이 계산
    let diffHours = hours - nowHours;
    let diffMins = mins - nowMins;

    // 분 조정
    if (diffMins < 0) {
      diffMins += 60;
      diffHours -= 1;
    }

    // 시간 조정
    if (diffHours < 0) {
      diffHours += 24;
    }

    const isNewSetting = !sessionStorage.getItem('sleepTime');
    sessionStorage.setItem('sleepTime', setTime);
    toggleModalIsOpen();

    const message = isNewSetting ? '취침모드 설정이 완료되었습니다!' : '취침모드 수정이 완료되었습니다!';

    alert(`${message}\n취침 예정 시간까지 약 ${diffHours}시간 ${diffMins}분 남았습니다.`);
  };

  return (
    <div className="h-full p-2">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={toggleModalIsOpen}
        className="fixed left-8 right-8 top-12 z-50"
        overlayClassName="fixed inset-0 bg-black transition-opacity duration-300 ease-in-out"
        closeTimeoutMS={300}
        style={{
          overlay: {
            backgroundColor: modalIsOpen ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
          },
        }}
      >
        <form
          onSubmit={handleSleepTimeSave}
          className={`flex w-full max-w-md flex-col justify-center rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ease-in-out ${
            modalContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <h2 className="mb-4 text-center text-2xl font-bold">취침모드 설정</h2>
          <input
            type="time"
            name="sleepTime"
            id="sleepTime"
            defaultValue={sleepTime}
            className="mb-4 h-10 w-full appearance-none text-lg"
          />
          <div className="flex justify-end">
            <Button type="button" variant="secondary" size="md" onClick={toggleModalIsOpen} className="mx-2">
              취소
            </Button>
            <Button type="submit" variant="primary" size="md">
              저장
            </Button>
          </div>
        </form>
      </Modal>

      <section className="mb-2 flex justify-end">
        {location.pathname !== '/streaming' && (
          <Button size="md" className="mr-auto text-white hover:text-gray-400" onClick={() => navigate(-1)}>
            <img src={back} alt="뒤로가기" className="w-[21px]" />
          </Button>
        )}
        <Button size="md" className="text-white hover:text-gray-400" onClick={toggleModalIsOpen}>
          취침모드 설정
        </Button>
      </section>
      <Outlet />
    </div>
  );
};

export default StreamingPage;
