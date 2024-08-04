import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import Button from '../components/Button';
import axios from 'axios';

import login from '../assets/login.svg';
import logout from '../assets/logout.svg';
import user from '../assets/user.svg';

const SettingsPage = () => {
  const navigate = useNavigate();

  // useRef를 사용하여 토글 상태를 관리
  const darkModeRef = useRef(false);
  const pushRef = useRef(false);

  // 상태 업데이트를 위한 useState
  const [darkMode, setDarkMode] = useState(darkModeRef.current);
  const [push, setPush] = useState(pushRef.current);

  // 사용자 로그인 상태 확인 코드 작성 예정 (일단은 임시로)
  const [isLogin, setIsLogin] = useState(false);

  // 사용자 닉네임 변경 모달 관리
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContentVisible, setModalContentVisible] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const toggleModalIsOpen = () => {
    if (!modalIsOpen) {
      setModalIsOpen(true);
      setTimeout(() => setModalContentVisible(true), 50);
    } else {
      setModalContentVisible(false);
      setTimeout(() => setModalIsOpen(false), 300);
    }
  };

  const handleInputChange = (event) => {
    setNewNickname(event.target.value);
  };

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
      url: '',
      headers: {
        Authorization: ``,
      },
    })
      .then((response) => {
        console.log(response);
        // 로그아웃 처리 후 로직 추가 예정
        navigate('/');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // 닉네임 변경사항 저장
  const handleNicknameSave = () => {
    axios({
      method: 'post',
      url: 'api/',
      headers: {
        Authorization: ``,
      },
    })
      .then((response) => {
        setModalContentVisible(false);
        setTimeout(() => setModalIsOpen(false), 300);
        alert('닉네임 변경이 왼료되었습니다!');
      })
      .catch((error) => {
        console.error('닉네임 변경 오류!', error);
        alert('닉네임 변경에 실패했습니다. 잠시 후 다시 변경해 주세요!');
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
        <div
          className={`flex w-full max-w-md flex-col justify-center rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ease-in-out ${
            modalContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <h2 className="mb-4 text-center text-2xl font-bold">닉네임 변경</h2>
          <input
            type="text"
            name="nickname"
            defaultValue={'임시 닉네임'}
            onChange={handleInputChange}
            className="focus:border-primary-300 mb-3 mt-1 block w-full rounded-md border-[1px] border-gray-200 p-2 text-center text-lg text-black shadow-sm"
          />
          <div className="flex justify-end">
            <Button variant="secondary" size="md" onClick={toggleModalIsOpen} className="mx-2">
              취소
            </Button>
            <Button variant="primary" size="md" onClick={handleNicknameSave}>
              저장
            </Button>
          </div>
        </div>
      </Modal>

      <h1 className="mb-20 mt-20 text-center text-3xl text-white">환경 설정</h1>
      <div className="fixed h-full w-full max-w-[600px] overflow-auto rounded-t-2xl bg-white p-6">
        {!isLogin && (
          <div className="mb-8 flex h-10 items-center justify-between">
            <p>로그인</p>
            <Link to="/login">
              <img src={login} alt="[login]" />
            </Link>
          </div>
        )}
        {isLogin && (
          <>
            <div className="mb-8 flex h-10 items-center justify-between">
              <p>로그아웃</p>
              <form onSubmit={handleLogout}>
                <Button type="submit" size="sm">
                  <img src={logout} alt="[logout]" />
                </Button>
              </form>
            </div>
            <div className="mb-8 flex h-10 items-center justify-between">
              <p>닉네임 변경</p>
              <Button size="sm" onClick={toggleModalIsOpen}>
                <img src={user} alt="[modify nickname]" />
              </Button>
            </div>
          </>
        )}
        <div className="mb-8 flex h-10 items-center justify-between">
          <p>다크모드 활성화</p>
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <input type="checkbox" checked={darkMode} onChange={handleDarkModeToggle} className="peer sr-only" />
              <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </div>
          </label>
        </div>
        {isLogin && (
          <div className="mb-8 flex h-10 items-center justify-between">
            <p>푸시 알림 활성화</p>
            <label className="flex cursor-pointer items-center justify-between">
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
