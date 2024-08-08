// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import axios from 'axios';

// 앱 내부의 컴포넌트
import Button from '../components/Button';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseURLState, isListeningState, userState } from '../recoil/atoms';

// 앱 내부의 이미지 및 아이콘
import { LargeLoadingSpinner, LargeRegeneratorIcon, SmallLoadingSpinner, SmallRegeneratorIcon } from '../assets/icons';

const DreamRegisterPage = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const baseURL = useRecoilValue(baseURLState);
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
  const [date, setDate] = useState(replaceDateType(new Date()));
  const [prevContent, setPrevContent] = useState('');
  const { dreamId } = useParams();
  const [dreamCategories, setDreamCategories] = useState(null);
  const accessToken = localStorage.getItem('accessToken');

  // const replaceDateType = (dateString) => {
  //   const year = dateString.substring(0, 4);
  //   const month = dateString.substring(4, 6);
  //   const day = dateString.substring(6, 8);
  //   return `${year}-${month}-${day}`;
  // };
  useEffect(() => {
    async function getDetail() {
      try {
        const requestData = {
          userId: user.userId,
        };
        const response = await axios.get(`${baseURL}/dream/${dreamId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: requestData,
        });
        const responseData = response.data.data;
        setContent(responseData.content);
        setImage(responseData.image);
        setInterpretation(responseData.interpretation);
        setIsShared(responseData.isShared);
        setPrevContent(responseData.content);
        setDreamCategories(responseData.dreamCategories);
        const writeTime = responseData.writeTime;
        const formattedDate = `${writeTime.slice(0, 4)}-${writeTime.slice(4, 6)}-${writeTime.slice(6, 8)}`;
        setDate(formattedDate);
      } catch (err) {
        console.log(err);
        handleError();
        navigate(-1);
      }
    }

    getDetail();
  }, []);

  /** 오류 처리 함수 */
  const handleError = () => {
    Swal.fire({
      title: 'ERROR',
      text: '오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '돌아가기',
    });
  };

  const navigateBack = () => {
    if (content != prevContent) {
      Swal.fire({
        title: '이전 페이지로 이동하시겠습니까?',
        text: '번경사항이 저장되지 않을 수 있습니다.',
        icon: 'warning',
        confirmButtonText: '확인',
        showCancelButton: true, // 취소 버튼을 추가하여 사용자가 선택할 수 있게 함
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(-1);
        }
      });
      return;
    }
    navigate(-1);
  };

  /** 상단바, 이전페이지로 돌아가기, 임시저장기능을 담당 */
  const UpperBar = () => {
    const deleteDream = async () => {
      try {
        const { value: confirmed } = await Swal.fire({
          title: '일기를 삭제하시겠습니까?',
          // text: '변경된 내용은 통계에 포함되지 않습니다.',
          icon: 'warning',
          confirmButtonText: '확인',
          showCancelButton: true, // 취소 버튼을 추가하여 사용자가 선택할 수 있게 함,
          denyButtonText: '취소',
        });
        if (confirmed) {
          const requestData = {};
          const response = await axios.delete(`${baseURL}/dream/${dreamId}`, requestData, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          navigate('/');
        }
      } catch {
        handleError();
      }
    };

    return (
      <div className="flex h-7 items-center justify-between">
        <button onClick={() => navigateBack()}>
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 13L1.5 7L7.5 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="text-base" onClick={() => deleteDream()}>
          삭제
        </button>
      </div>
    );
  };

  // 2) 날짜선택 컴포넌트

  /** 날짜선택 컴포넌트 */
  const DateSelector = () => {
    /** 미래의 날짜 선택시 오류 반환, 선택된 날짜는 Date 형식으로 변경 */
    const handleDate = (event) => {
      const current = replaceDateType(new Date());
      const selected = event.target.value;
      selected <= current
        ? setDate(selected)
        : Swal.fire({
            title: 'ERROR',
            text: '일기는 현재 또는 과거의 날짜에 대해서만 작성할 수 있습니다.',
            icon: 'error',
            confirmButtonText: '확인',
          });
    };

    return (
      <div className="my-1 flex justify-center rounded-lg">
        <input
          value={date}
          type="date"
          onChange={(e) => handleDate(e)}
          className="bg-inherit text-center md:text-base lg:text-lg"
        />
      </div>
    );
  };

  // 3) 꿈 일기 content 입력
  const MIN_LENGTH = 25;
  const MAX_LENGTH = 500;

  // 3) 내용입력시 textarea에 반영
  const contentRef = useRef(null);

  const handleContent = (e) => {
    setIsInterpVisible(false);
    setContent(e.target.value);
    if (e.target.value.length <= MAX_LENGTH) {
      setContent(e.target.value);
    }
  };

  // 음성인식 관련 함수들
  const [isListening, setIsListening] = useRecoilState(isListeningState);
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false; // 중간 결과 포함여부

  useEffect(() => {
    if (isListening) {
      // 녹음이 시작하면
      recognition.start();
    } else {
      recognition.stop();
    }
  }, [isListening]);

  recognition.onstart = () => {
    console.log('start!');
  };

  // 녹음이 끝나면
  recognition.opspeechend = () => {
    setIsListening(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    setIsListening(false);
    const transcript = event.results[0][0].transcript;
    console.table('transcript', transcript);
    insertTextAtCursor(transcript);
  };
  recognition.onerror = () => {
    handleError();
  };

  const insertTextAtCursor = (textToInsert) => {
    // 현재 contentRef가 위치한 태그
    if (contentRef.current) {
      const contentArea = contentRef.current;
      const startPoint = contentArea.selectionStart;
      const endPoint = contentArea.selectionEnd;
      const newContent = content.slice(0, startPoint) + textToInsert + content.slice(endPoint);
      setContent(newContent);
    } else {
      setContent((prev) => prev + textToInsert);
    }
  };

  // 꿈 해석 화면 표시 여부
  const [isInterpVisible, setIsInterpVisible] = useState(false);

  async function handleInterp() {
    try {
      if (content.length < MIN_LENGTH) {
        Swal.fire({
          text: `정확한 해석을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
          icon: 'warning',
          confirmButtonText: '확인',
        });
        return 0;
      }
      setIsInterpVisible(true);
      const requestData = {
        message: content,
      };
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post(`${baseURL}/api/generate-interpretation`, requestData, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
      });
      setInterpretation(response.data.data);
    } catch (err) {
      handleError();
    }
  }

  const closeInterp = () => {
    setIsInterpVisible(false);
  };

  // 4) 로딩스피너
  /** 로딩스피너, 꿈 해석용으로 작성되었음 */
  const InterpLoadingSpinner = () => {
    return (
      <button className="flex w-full items-center justify-center rounded-lg bg-primary-500 py-3">
        <SmallLoadingSpinner />
        꿈을 해석하고 있습니다.
      </button>
    );
  };

  // 5) 이미지 생성 컴포넌트
  const [options, setOptions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  /** 이미지를 생성해주는 함수, 필요데이터 : content */
  const censoredImageUrl = '/src/assets/MainpageTest.jpg'; // 검열된 이미지의 URL
  async function handleImgGenerator() {
    try {
      if (content.length < MIN_LENGTH) {
        Swal.fire({
          text: `정확한 이미지 생성을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
          icon: 'warning',
          confirmButtonText: '확인',
        });
        return 0;
      }
      // 이미지 생성하려고 할때마다 다시 초기화하기!
      setImage(null);
      setIsGenerating(true);

      const requestData = {
        prompt: content,
      };
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post(`${baseURL}/api/generate-image`, requestData, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
      });
      const censoredOptions = response.data.data;
      while (censoredOptions.length < 4) {
        censoredOptions.push(censoredImageUrl);
      }
      setOptions(censoredOptions);
    } catch {
      handleError();
    }
  }

  async function imgRegenerator() {
    try {
      setOptions([]);
      setSelectedImg(null);
      await handleImgGenerator();
    } catch {
      handleError();
    }
  }
  const handleSelected = (i) => {
    if (options[i] == censoredImageUrl) {
      Swal.fire({
        icon: 'warning',
        text: '검열된 이미지는 선택할 수 없습니다.',
        confirmButtonText: '확인',
      });
      return;
    }
    setSelectedImg(i);
  };

  const handleImage = (i) => {
    setImage(options[i]);
    setIsGenerating(false);
  };

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

      /// 카테고리
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

  const toggle = () => {
    if (image == null || interpretation == null) {
      Swal.fire({
        title: 'ERROR',
        text: '꿈을 공유하기 위해 해석과 이미지를 생성해주세요.',
      });
      return;
    }
    setIsShared(!isShared);
  };

  return (
    // 이 부분 최소 높이 class 수정 필요!!
    <div className="flex flex-col px-6 py-3 text-white" style={{ minheight: '100vh' }}>
      <UpperBar />
      <DateSelector />
      {/* 꿈내용 입력 - textarea */}
      <div className="relative">
        <textarea
          ref={contentRef}
          className={`${classList} h-40 w-full resize-none placeholder:text-slate-300`}
          value={content}
          onChange={(e) => {
            handleContent(e);
          }}
          placeholder="꿈 내용을 입력해주세요."
        ></textarea>
        <p className="absolute bottom-5 right-2 text-slate-500">
          {content.length}/{MAX_LENGTH}
        </p>
      </div>
      {/* 꿈 해석공간 */}
      <div>
        {isInterpVisible ? (
          interpretation == null ? (
            <button className="flex w-full items-center justify-center rounded-lg bg-primary-500 py-3">
              {SmallLoadingSpinner}
              <span>꿈을 해석하고 있습니다.</span>
            </button>
          ) : (
            <div
              className={`${classList} flex-col justify-center ${interpretation ? '' : 'bg-primary-500 opacity-100'}`}
            >
              <div>
                <p className="pb-3 text-center text-lg font-bold">꿈 해석</p>
                {interpretation && <p>{interpretation}</p>}
                <button className="mx-auto mt-4 block text-center text-slate-100" onClick={() => closeInterp()}>
                  닫기
                </button>
              </div>
            </div>
          )
        ) : (
          <Button children="꿈 해석 보기" onClick={() => handleInterp()} variant={'primary'} fullWidth={true}></Button>
        )}
      </div>

      {/* 이미지 생성 공간 */}
      {image != null ? (
        <div className={`${classList} relative`}>
          <button onClick={() => imgRegenerator()} className="z-1 absolute right-6 top-6">
            {SmallRegeneratorIcon}
          </button>
          <img src={image}></img>
        </div>
      ) : isGenerating == false ? (
        <button
          onClick={() => handleImgGenerator()}
          className="my-2 w-full flex-row items-center justify-center rounded-lg bg-primary-500 p-4"
        >
          <img className="inline-block h-20 w-20" src="../src/assets/img_generator.png" alt="이미지 생성하기"></img>
          <p className="py-2 font-bold">꿈 이미지 생성하기</p>
        </button>
      ) : options.length == 0 ? (
        <button className={`${classList} h-40 flex-col items-center justify-center`}>{LargeLoadingSpinner}</button>
      ) : (
        (selectedImg == null || image == null) && (
          <div className={`${classList}`}>
            <div className="grid grid-cols-2">
              {options.map((e, i) => (
                <div
                  key={i}
                  className={`relative block h-full p-1 ${selectedImg == i ? 'rounded-lg border border-slate-100' : null}`}
                >
                  <img
                    onClick={() => handleSelected(i)}
                    className="block h-full w-full rounded-lg"
                    src={e}
                    key={i}
                  ></img>
                  {selectedImg == i ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 text-white">
                      <button
                        className="rounded-full bg-primary-500 px-3 py-1 text-white"
                        onClick={() => {
                          handleImage(i);
                        }}
                      >
                        선택
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="my-3 flex justify-around">
              <button onClick={() => imgRegenerator()}>{LargeRegeneratorIcon}</button>
            </div>
          </div>
        )
      )}

      <div className="mx-2 flex justify-between">
        <div>꿈 공유하기</div>
        {/* <input type="checkbox" className="peer sr-only" /> */}
        <div className="flex items-center">
          <div
            id="toggleButton"
            className={`relative inline-flex cursor-pointer items-center rounded-xl ${isShared ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={toggle}
          >
            <div className="h-5 w-10 rounded-full"></div>
            <div
              className={`absolute h-6 w-6 rounded-full border-2 bg-white transition-transform ${
                isShared ? 'translate-x-5 border-blue-500' : 'border-gray-300'
              }`}
              id="toggleSwitch"
            ></div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button onClick={() => saveDream()} className="my-5 h-10 w-32 rounded-full bg-primary-700 font-bold">
          저장하기
        </button>
      </div>
    </div>
  );
};

export default DreamRegisterPage;
