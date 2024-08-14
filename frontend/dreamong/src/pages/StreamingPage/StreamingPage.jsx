import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Button from '../../components/Button';
import { useNavigate, Outlet } from 'react-router-dom';

import { useSetRecoilState, useRecoilValue } from 'recoil';
import { baseURLState, userState } from '../../recoil/atoms';

import back from '../../assets/back.svg';

// Make sure to set the app element for accessibility
Modal.setAppElement('#root');

const StreamingPage = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContentVisible, setModalContentVisible] = useState(false);
  const [sleepTime, setSleepTime] = useState(sessionStorage.getItem('sleepTime') || null);

  const baseURL = useRecoilValue(baseURLState);
  const setUser = useSetRecoilState(userState);
  const mainRef = useRef(null);
  const ScrollToDiv = () => {
    // 참조된 div가 있으면 그 위치로 스크롤 이동
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
      console.log(window.scrollY);
    }
  };

  useEffect(() => {
    ScrollToDiv();
    fetchUserInfo();

    // 취침 시간 설정 관련
    let intervalId;

    // sleepTime이 존재할 때만 취침 시간 체크 인터벌 설정
    if (sleepTime) {
      intervalId = setInterval(checkSleepTime, 2000);
    }

    // localStorage의 sleepTime 변경 감지
    const handleStorageChange = (event) => {
      if (event.key === 'sleepTime') {
        const updatedSleepTime = sessionStorage.getItem('sleepTime');
        setSleepTime(updatedSleepTime);

        // 인터벌 초기화
        if (intervalId) {
          clearInterval(intervalId);
        }
        if (updatedSleepTime) {
          intervalId = setInterval(checkSleepTime, 2000);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [sleepTime]);

  const fetchUserInfo = () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return navigate('/login');
    }

    axios({
      method: 'get',
      url: `${baseURL}/users/info`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    }).then((response) => {
      setUser(response.data.data);
    });
  };

  // 취침 시간 체크 함수
  const checkSleepTime = () => {
    if (!sleepTime) return; // sleepTime이 null이면 함수 종료

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (currentTime === sleepTime) {
      navigate('/streaming'); // 스트리밍 목록 URL로 이동
      alert('취침 모드가 실행되었습니다!');
    }
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
    <div ref={mainRef} className="min-h-[calc(100vh-60px)] bg-[#222222] p-2">
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
          <Button size="md" className="mr-auto text-white hover:text-gray-400" onClick={() => navigate('/streaming')}>
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
