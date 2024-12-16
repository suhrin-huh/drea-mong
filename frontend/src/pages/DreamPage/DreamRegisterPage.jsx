// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseURLState, isListeningState, userState } from '../../recoil/atoms';

// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import axios from 'axios';

// 앱 내부의 컴포넌트/아이콘
import Button from '../../components/Button';
import { useHandleError } from '../../utils/utils';
import {
  LargeLoadingSpinner,
  LargeRegeneratorIcon,
  SmallLoadingSpinner,
  SttWaveBar,
  SaveBar,
} from '../../assets/icons';
import UpperBar from './components/UpperBar';
import DatePicker from './components/DatePicker';
import ContentBox from './components/ContentBox';
import InterpretationBox from './components/InterpretationBox';
import ImageGenerator from './components/ImageGenerator';
import ShareSettings from './components/ShareSettings';

const DreamRegisterPage = () => {
  const navigate = useNavigate();
  const handleError = useHandleError();

  // box별로 같은 기본 클래스들 정리
  const classList = 'my-2 p-3 bg-black bg-opacity-50 rounded-lg';

  // recoil atoms
  const [user, setUser] = useRecoilState(userState);
  const baseURL = useRecoilValue(baseURLState);
  const accessToken = localStorage.getItem('accessToken');

  // 꿈 등록을 위해 필요한 데이터
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [isShared, setIsShared] = useState(false);

  /** 음성인식 작동 여부 */
  const isListening = useRecoilValue(isListeningState);

  /** 꿈 해석 화면 표시 여부 */
  const [isInterpVisible, setIsInterpVisible] = useState(false);

  // 저장시에 응답이 올때까지 대체화면 표시
  const [isSaving, setIsSaving] = useState(false);

  /** 꿈 일기 최소, 최대 길이 # MIN_LENGTH, MAX_LENGTH */
  const MIN_LENGTH = 25;
  const MAX_LENGTH = 500;

  /** Date 타입의 변수를 넣으면 yyyy-mm-dd로 수정해주는 함수*/
  const replaceDateType = (date) => {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜의 형식을 변경해야하므로 함수 설정 후에 변수 선언
  const [date, setDate] = useState(replaceDateType(new Date()));

  const mainRef = useRef(null);
  const ScrollToDiv = () => {
    // 참조된 div가 있으면 그 위치로 스크롤 이동
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
      console.log(window.scrollY);
    }
  };

  /** 초기 렌더링시에 accessToken 존재 유무 파악 후 없으면 redirect to login page*/
  useEffect(() => {
    ScrollToDiv();
    if (!accessToken) {
      navigate('/login');
    }
    axios
      .get(`${baseURL}/users/info`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      })
      .then((response) => {
        // console.log('유저정보 가져왔어!', response);
        setUser(response.data.data);
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          handleError('/');
        }
      });
  }, []);

  // 이미지를 새로 만들때에 공유하기 갱신
  useEffect(() => {
    if (!image) {
      setIsShared(false);
    }
  });

  const saveDream = async () => {
    try {
      // 저장중에는 추가적인 저장 불가능하도록 설정
      if (isSaving) {
        return;
      }

      if (content.replace(/ /g, '') == '') {
        Swal.fire({
          title: 'ERROR',
          icon: 'error',
          text: '공백은 저장이 불가능합니다.',
        });
        return;
      }

      if (content.length < MIN_LENGTH) {
        Swal.fire({
          text: `정확한 통계을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
          icon: 'warning',
          confirmButtonText: '확인',
        });
        return 0;
      }

      // 유효성 통과 후 저장 시작
      if (isSaving) return;
      setIsSaving(true);
      const response = await axios.post(
        `${baseURL}/dream/create`,
        {
          content: content,
          image: image,
          interpretation: interpretation,
          userId: user.userId,
          isShared: isShared,
          writeTime: date.replace(/-/g, ''),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
          withCredentials: true,
        },
      );
      console.log(response.data);
      navigate('/');
    } catch (error) {
      console.log(err);
      setIsSaving(false);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        navigate('/error');
      }
    }
  };

  return (
    <div ref={mainRef} className="relative flex min-h-dvh flex-col px-6 py-3 text-white" style={{ minheight: '100vh' }}>
      {/* 음성인식 여부에 따른 animation */}
      {isListening ? SttWaveBar : null}

      {/* 저장 중 loading page */}
      {isSaving ? SaveBar : null}

      <UpperBar content={content} image={image} interpretation={interpretation} date={date} mode={'save'} />
      <DatePicker date={date} setDate={setDate} replaceDateType={replaceDateType} />
      <ContentBox
        content={content}
        setContent={setContent}
        MAX_LENGTH={MAX_LENGTH}
        setIsInterpVisible={setIsInterpVisible}
        classList={classList}
      />
      <InterpretationBox
        classList={classList}
        MIN_LENGTH={MIN_LENGTH}
        content={content}
        interpretation={interpretation}
        setInterpretation={setInterpretation}
        isInterpVisible={isInterpVisible}
        setIsInterpVisible={setIsInterpVisible}
      />
      <ImageGenerator
        MIN_LENGTH={MIN_LENGTH}
        classList={classList}
        content={content}
        image={image}
        setImage={setImage}
      />
      <p className="px-2 pb-2 pt-1 text-center text-[12px]">
        드리-몽도 실수할 수 있습니다. 이미지가 검열될 수 있습니다.
      </p>
      <ShareSettings isShared={isShared} setIsShared={setIsShared} interpretation={interpretation} image={image} />

      <div className="flex justify-center">
        <button onClick={() => saveDream()} className="my-5 h-10 w-32 rounded-full border bg-primary-500 font-bold">
          저장하기
        </button>
      </div>
    </div>
  );
};

export default DreamRegisterPage;
