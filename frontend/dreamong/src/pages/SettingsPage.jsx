import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import axios from 'axios';

import login from '../assets/login.svg';
import logout from '../assets/logout.svg';

const SettingsPage = () => {
  const navigate = useNavigate();

  // useRef를 사용하여 토글 상태를 관리
  const darkModeRef = useRef(false);
  const pushRef = useRef(false);

  // 상태 업데이트를 위한 useState
  const [darkMode, setDarkMode] = useState(darkModeRef.current);
  const [push, setPush] = useState(pushRef.current);

  // 사용자 로그인 상태 확인 코드 작성 예정 (일단은 임시로)
  const [isLogin, setIsLogin] = useState(localStorage.getItem('accessToken') ? true : false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedPush = localStorage.getItem('push');

    if (savedDarkMode !== null) {
      darkModeRef.current = JSON.parse(savedDarkMode);
      setDarkMode(darkModeRef.current);
    }

    if (savedPush !== null) {
      pushRef.current = JSON.parse(savedPush);
      setPush(pushRef.current);
    }
  }, []);

  // 로그아웃 핸들러 (api URL 확인 후 수정 필요)
  const handleLogout = () => {
    axios({
      method: 'post',
      url: 'api/user/logout',
    })
      .then((response) => {
        console.log(response);
        // 로그아웃 처리 후 로직 추가 예정
        localStorage.removeItem('accessToken');
        navigate('/');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // 다크 모드 토글 핸들러
  const handleDarkModeToggle = () => {
    darkModeRef.current = !darkModeRef.current;
    setDarkMode(darkModeRef.current);
    localStorage.setItem('darkMode', JSON.stringify(darkModeRef.current));

    // 다크 모드 적용 로직 (예: body에 클래스 추가/제거)
    if (darkModeRef.current) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  // 푸시 알림 토글 핸들러
  const handlePushToggle = () => {
    pushRef.current = !pushRef.current;
    setPush(pushRef.current);
    localStorage.setItem('push', JSON.stringify(pushRef.current));

    // 서버에 푸시 알림 설정 변경 요청
    axios({
      method: 'post',
      url: '/api/settings/push',
      data: { push: pushRef.current },
    })
      .then((response) => {
        console.log('푸시 알림 설정이 서버에 저장되었습니다.');
      })
      .catch((error) => {
        console.error('푸시 알림 설정 저장 중 오류 발생:', error);
      });
  };

  return (
    <>
      <h1 className="mb-20 mt-20 text-center text-3xl text-white">환경 설정</h1>
      <div className="fixed h-full w-full max-w-[600px] overflow-auto rounded-t-2xl bg-white p-6">
        {!isLogin && (
          <div className="mb-10 flex justify-between">
            <p>로그인</p>
            <Link to="/login">
              <img src={login} alt="loginIcon" />
            </Link>
          </div>
        )}
        {isLogin && (
          <div className="mb-10 flex justify-between">
            <p>로그아웃</p>
            <form onSubmit={handleLogout}>
              <Button type="submit">
                <img src={logout} alt="logoutIcon" />
              </Button>
            </form>
          </div>
        )}
        <div className="mb-10 flex justify-between">
          <p>다크모드 활성화</p>
          <label className="mb-2 flex cursor-pointer items-center justify-between">
            <div>
              <input type="checkbox" checked={darkMode} onChange={handleDarkModeToggle} className="peer sr-only" />
              <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </div>
          </label>
        </div>
        {isLogin && (
          <div className="mb-10 flex justify-between">
            <p>푸시 알림 활성화</p>
            <label className="mb-2 flex cursor-pointer items-center justify-between">
              <div>
                <input type="checkbox" checked={push} onChange={handlePushToggle} className="peer sr-only" />
                <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
              </div>
            </label>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
