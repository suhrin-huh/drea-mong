import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import axios from 'axios';
import { DREAM_MIN_LENGTH, DREAM_MAX_LENGTH, formatDreamDate } from '@/entities/dream';
import { baseURLState } from '@/shared/config/server.atoms';
import {
  isListeningState,
  SpeechListeningOverlay,
  DreamSavingOverlay,
  DreamEditorHeader,
  DreamDatePicker,
  DreamContentInput,
  DreamInterpretationPanel,
  DreamImageGenerator,
  DreamShareToggle,
} from '@/features/dream-editor';
import { userState } from '@/entities/user';
import { Button } from '@/shared/ui/button';
import { useHandleError } from '@/shared/lib/error';
import RegenerateIcon from '@/shared/ui/icons/RegenerateIcon';
import { LoadingSpinner } from '@/shared/ui/loading-spinner';
import 'sweetalert2/src/sweetalert2.scss';

const DreamEditPage = () => {
  const navigate = useNavigate();
  const handleError = useHandleError();
  const [user, setUser] = useRecoilState(userState);
  const baseURL = useRecoilValue(baseURLState);
  const { dreamId } = useParams();

  /** 꿈 일기 최소, 최대 길이 # DREAM_MIN_LENGTH, DREAM_MAX_LENGTH */
  const classList = 'my-2 p-3 bg-black bg-opacity-50 rounded-lg';

  /** Date 타입의 변수를 넣으면 yyyy-mm-dd로 수정해주는 함수*/

  // 꿈 등록을 위해 필요한 데이터
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [isShared, setIsShared] = useState(false);
  // 날짜의 형식을 변경해야하므로 함수 설정 후에 변수 선언
  const [date, setDate] = useState(formatDreamDate(new Date()));
  const [writerId, setWriterId] = useState();
  const accessToken = localStorage.getItem('accessToken');

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
    if (!accessToken) {
      navigate('/login');
      return;
    }
    axios
      .get(`${baseURL}/users/info`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      })
      .then((response) => {
        setUser(response.data.data);
        return axios.get(`${baseURL}/dream/${dreamId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
      })
      .then((res) => {
        const responseData = res.data.data;
        if (responseData.userId != user.userId) {
          console.log(responseData, 'user', user);
          navigate('/');
          return;
        }
        setWriterId(responseData.userId);
        setContent(responseData.content);
        setImage(responseData.image);
        setInterpretation(responseData.interpretation);
        setIsShared(responseData.shared);
        const writeTime = responseData.writeTime;
        const formattedDate = `${writeTime.slice(0, 4)}-${writeTime.slice(4, 6)}-${writeTime.slice(6, 8)}`;
        setDate(formattedDate);
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          navigate('/error');
        }
      });
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
      // 공백 확인
      if (content.replace(/ /g, '') === '') {
        Swal.fire({
          title: 'ERROR',
          icon: 'error',
          text: '공백은 저장이 불가능합니다.',
        });
        return;
      }

      // 최소 길이 확인
      if (content.length < DREAM_MIN_LENGTH) {
        Swal.fire({
          text: `정확한 해석을 위해 꿈 내용을 ${DREAM_MIN_LENGTH}자 이상 작성해주세요.`,
          icon: 'warning',
          confirmButtonText: '확인',
        });
        return;
      }

      if (isSaving) return;
      setIsSaving(true);

      if (!accessToken) {
        navigate('/login');
        return;
      }

      const dreamResponse = await axios.get(`${baseURL}/dream/${dreamId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      const responseData = dreamResponse.data.data;

      // 주석 처리된 권한 확인 부분
      if (writerId !== user.userId) {
        await Swal.fire({
          icon: 'error',
          text: '글 수정 권한이 없습니다.',
        });
        navigate('/');
        return;
      }

      // 업데이트 요청 실행
      const updateResponse = await axios.put(
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
          withCredentials: true,
        },
      );
      // updateResponse();
      // 성공 시 알림 및 페이지 이동
      Swal.fire({
        icon: 'success',
        text: '저장이 완료되었습니다.',
      });

      navigate('/');
    } catch (error) {
      console.log(error);
      setIsSaving(false);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        handleError('/');
      }
    }
  };

  return (
    // 이 부분 최소 높이 class 수정 필요!!
    <div ref={mainRef} className="flex flex-col px-6 py-3 text-white" style={{ minheight: '100vh' }}>
      {/* 음성인식 여부에 따른 animation */}
      {isListening ? <SpeechListeningOverlay /> : null}

      {/* 저장 중 loading page */}
      {isSaving ? <DreamSavingOverlay /> : null}
      {/* {isSaving ? null : DreamSavingOverlay} */}
      <DreamEditorHeader
        content={content}
        image={image}
        interpretation={interpretation}
        date={date}
        dreamId={dreamId}
        mode={'delete'}
      />
      <DreamDatePicker date={date} setDate={setDate} formatDate={formatDreamDate} />
      <DreamContentInput
        content={content}
        setContent={setContent}
        maxLength={DREAM_MAX_LENGTH}
        setIsInterpVisible={setIsInterpVisible}
        classList={classList}
      />
      <DreamInterpretationPanel
        classList={classList}
        minLength={DREAM_MIN_LENGTH}
        content={content}
        interpretation={interpretation}
        setInterpretation={setInterpretation}
        isInterpVisible={isInterpVisible}
        setIsInterpVisible={setIsInterpVisible}
      />
      <DreamImageGenerator
        minLength={DREAM_MIN_LENGTH}
        classList={classList}
        content={content}
        image={image}
        setImage={setImage}
      />
      <p className="px-2 pb-2 pt-1 text-center text-[12px]">
        드리-몽도 실수할 수 있습니다. 이미지가 검열될 수 있습니다.
      </p>
      <DreamShareToggle isShared={isShared} setIsShared={setIsShared} interpretation={interpretation} image={image} />

      <div className="flex justify-center">
        <button onClick={() => saveDream()} className="my-5 h-10 w-32 rounded-full border bg-primary-500 font-bold">
          저장하기
        </button>
      </div>
    </div>
  );
};

export default DreamEditPage;
