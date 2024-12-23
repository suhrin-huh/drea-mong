// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import api from '../../utils/api';

import { SttWaveBar, SaveBar } from '../../assets/icons';
import UpperBar from './components/UpperBar';
import DatePicker from './components/DatePicker';
import ContentBox from './components/ContentBox';
import InterpretationBox from './components/InterpretationBox';
import ImageGenerator from './components/ImageGenerator';
import ShareSettings from './components/ShareSettings';

// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseURLState, isListeningState, userState } from '../../recoil/atoms';
// 앱 내부의 컴포넌트/아이콘
import { useHandleError } from '../../utils/utils';
import SaveButton from './components/SavaButton';

const DreamDetailPage = () => {
  const navigate = useNavigate();
  const handleError = useHandleError();
  const [user, setUser] = useRecoilState(userState);
  const { dreamId } = useParams();

  /** 꿈 일기 최소, 최대 길이 # MIN_LENGTH, MAX_LENGTH */
  const MIN_LENGTH = 25;
  const MAX_LENGTH = 500;
  const classList = 'my-2 p-3 bg-black bg-opacity-50 rounded-lg';

  /** Date 타입의 변수를 넣으면 yyyy-mm-dd로 수정해주는 함수*/
  const replaceDateType = (date) => {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 꿈 등록을 위해 필요한 데이터
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [interp, setInterp] = useState(null);
  const [isShared, setIsShared] = useState(false);
  // 날짜의 형식을 변경해야하므로 함수 설정 후에 변수 선언
  const [date, setDate] = useState(replaceDateType(new Date()));
  const [writerId, setWriterId] = useState();

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
        // const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        const userRes = await api.get(`/users/info`);
        setUser(userRes.data.data);

        const dreamRes = await api.get(`/dream/${dreamId}`);
        const dream = dreamRes.data.data;
        if (dream.userId != user.userId) {
          console.log(dream, 'user', user);
          navigate('/');
          return;
        }
        setWriterId(dream.userId);
        setContent(dream.content);
        setImage(dream.image);
        setInterp(dream.interpretation);
        setIsShared(dream.shared);
        const writeTime = dream.writeTime;
        const formattedDate = `${writeTime.slice(0, 4)}-${writeTime.slice(4, 6)}-${writeTime.slice(6, 8)}`;
        setDate(formattedDate);
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          navigate('/error');
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!image) {
      setIsShared(false);
    }
  }, [image]);

  /** 음성인식 작동 여부 */
  const isListening = useRecoilValue(isListeningState);

  // 저장시에 응답이 올때까지 대체화면 표시
  const [isSaving, setIsSaving] = useState(false);

  return (
    // 이 부분 최소 높이 class 수정 필요!!
    <div ref={mainRef} className="flex flex-col px-6 py-3 text-white" style={{ minheight: '100vh' }}>
      {isListening ? SttWaveBar : null}
      {isSaving ? SaveBar : null}
      <UpperBar mode={'delete'} />
      <DatePicker initial={date} />
      <ContentBox initial={content} MAX_LENGTH={MAX_LENGTH} classList={classList} />
      <InterpretationBox classList={classList} MIN_LENGTH={MIN_LENGTH} initial={interp} />
      <ImageGenerator MIN_LENGTH={MIN_LENGTH} classList={classList} initial={image} />
      <p className="px-2 pb-2 pt-1 text-center text-[12px]">
        드리-몽도 실수할 수 있습니다. 이미지가 검열될 수 있습니다.
      </p>
      <ShareSettings initial={isShared} />
      <SaveButton MIN_LENGTH={MIN_LENGTH} />
    </div>
  );
};

export default DreamDetailPage;
