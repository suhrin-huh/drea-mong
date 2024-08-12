// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  const user = useRecoilValue(userState);
  const baseURL = useRecoilValue(baseURLState);
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
  const [interpretation, setInterpretation] = useState(null);
  const [isShared, setIsShared] = useState(false);
  // 날짜의 형식을 변경해야하므로 함수 설정 후에 변수 선언
  const [date, setDate] = useState(replaceDateType(new Date()));
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    async function getDetail() {
      try {
        if (!accessToken) {
          navigate('/login');
          return;
        }
        const requestData = {
          userId: user.userId,
        };
        const response = await axios.get(`${baseURL}/dream/${dreamId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: requestData,
        });
        const responseData = response.data.data;
        if (responseData.userId != user.userId) {
          navigate('/');
        }
        setContent(responseData.content);
        setImage(responseData.image);
        setInterpretation(responseData.interpretation);
        setIsShared(responseData.isShared);
        const writeTime = responseData.writeTime;
        const formattedDate = `${writeTime.slice(0, 4)}-${writeTime.slice(4, 6)}-${writeTime.slice(6, 8)}`;
        setDate(formattedDate);
      } catch (err) {
        console.log(err);
        handleError('/login');
      }
    }
    getDetail();
  }, []);

  useEffect(() => {
    if (!image) {
      setIsShared(false);
    }
  }, [image]);

  /** 음성인식 작동 여부 */
  const isListening = useRecoilValue(isListeningState);

  /** 꿈 해석 화면 표시 여부 */
  const [isInterpVisible, setIsInterpVisible] = useState(false);

  // 저장시에 응답이 올때까지 대체화면 표시
  const [isSaving, setIsSaving] = useState(false);

  /** 꿈 일기 수정 후 저장 */
  const saveDream = async () => {
    try {
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
          text: `정확한 해석을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
          icon: 'warning',
          confirmButtonText: '확인',
        });
        return 0;
      }

      setIsSaving(true);
      const response = await axios.put(
        `${baseURL}/dream/${dreamId}`,
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
        },
      );
      console.log(response.data);
      navigate('/');
    } catch (err) {
      handleError();
    }
  };

  return (
    // 이 부분 최소 높이 class 수정 필요!!
    <div className="flex flex-col px-6 py-3 text-white" style={{ minheight: '100vh' }}>
      {/* 음성인식 여부에 따른 animation */}
      {isListening ? SttWaveBar : null}

      {/* 저장 중 loading page */}
      {isSaving ? SaveBar : null}
      {/* {isSaving ? null : SaveBar} */}
      <UpperBar
        content={content}
        image={image}
        interpretation={interpretation}
        date={date}
        dreamId={dreamId}
        mode={'delete'}
      />
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
