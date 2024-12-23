// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import axios from 'axios';

// 앱 내부의 컴포넌트/아이콘
import { useHandleError } from '../../utils/utils';
import { SttWaveBar } from '../../assets/icons';
import UpperBar from './components/UpperBar';
import DatePicker from './components/DatePicker';
import ContentBox from './components/ContentBox';
import InterpretationBox from './components/InterpretationBox';
import ImageGenerator from './components/ImageGenerator';
import ShareSettings from './components/ShareSettings';
import SaveButton from './components/SavaButton';

// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseURLState, isListeningState, userState } from '../../recoil/atoms';

const DreamRegisterPage = () => {
  const classList = 'my-2 p-3 bg-black bg-opacity-50 rounded-lg';

  const navigate = useNavigate();
  const handleError = useHandleError();

  const [user, setUser] = useRecoilState(userState);
  const baseURL = useRecoilValue(baseURLState);
  const accessToken = localStorage.getItem('accessToken');

  /** 음성인식 작동 여부 */
  const isListening = useRecoilValue(isListeningState);

  /** 꿈 일기 최소, 최대 길이 # MIN_LENGTH, MAX_LENGTH */
  const MIN_LENGTH = 25;
  const MAX_LENGTH = 500;

  const mainRef = useRef(null);
  const ScrollToDiv = () => {
    // 참조된 div가 있으면 그 위치로 스크롤 이동
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
      console.log(window.scrollY);
    }
  };

  useEffect(() => {
    async () => {
      ScrollToDiv();
      try {
        // if (!accessToken) {
        //   navigate('/login');
        // }

        // user data 가져오기
        const response = await axios.get(`${baseURL}/users/info`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        setUser(response.data.data);
      } catch (error) {
        // console.log(error);
        // if (error.response && error.response.status === 401) {
        //   navigate('/login');
        // } else {
        //   handleError('/');
        // }
      }
    };
  }, []);

  return (
    <div ref={mainRef} className="relative flex min-h-dvh flex-col px-6 py-3 text-white" style={{ minheight: '100vh' }}>
      {isListening ? SttWaveBar : null}
      <UpperBar mode={'save'} />
      <DatePicker initial={null} />
      <ContentBox initial={''} MAX_LENGTH={MAX_LENGTH} classList={classList} />
      <InterpretationBox classList={classList} MIN_LENGTH={MIN_LENGTH} initial={''} />
      <ImageGenerator MIN_LENGTH={MIN_LENGTH} classList={classList} initial={''} />
      <p className="px-2 pb-2 pt-1 text-center text-[12px]">
        드리-몽도 실수할 수 있습니다. 이미지가 검열될 수 있습니다.
      </p>
      <ShareSettings initial={false} />
      <SaveButton MIN_LENGTH={MIN_LENGTH} />
    </div>
  );
};

export default DreamRegisterPage;
