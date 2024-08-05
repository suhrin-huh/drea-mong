// 의존성 파일 설치 목록

// 1) npm install sweetalert2
import Swal, { swal } from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

// ----------------------------------------------------
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import { baseURLState } from '../recoil/test';

const DreamRegisterPage = () => {
  // box별로 같은 기본 클래스들 정리
  const classList = 'my-2 p-3 bg-black bg-opacity-50 rounded-lg';

  // 꿈 등록을 위해 필요한 데이터
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [interpretation, setInterpretation] = useState(null);

  /** 오류 처리 함수 */
  const handleError = () => {
    Swal.fire({
      title: 'ERROR',
      text: '오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '돌아가기',
    });
  };

  const navigate = useNavigate();
  const navigateBack = () => {
    navigate(-1);
  };
  /** 상단바, 이전페이지로 돌아가기, 임시저장기능을 담당 */
  const UpperBar = () => {
    const saveDraft = () => {
      Swal.fire({
        title: '임시저장하시겠습니까?',
        text: '임시저장된 일기는 통계에 포함되지 않습니다.',
        // icon:'warning',
        confirmButtonText: '확인',
      })
        .then(async (result) => {
          if (result.isConfirmed) {
            const requestData = {
              content: content,
              image: image,
              interpretation: interpretation,
              userId: 1,
              writetime: date.replace(/-/g, ''),
            };
            // const response = await axios.post('/dream/temporary', requestData);
            const response = await axios.get(`${baseURLState}/test/`, requestData);
            // navigate('/');
            console.log(response.data);
          }
        })
        .catch(() => {
          console.log(date.replace('-', ''));
          handleError();
        });
    };

    return (
      <div className="flex h-7 items-center justify-between">
        <button onClick={() => navigateBack()}>
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 13L1.5 7L7.5 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="text-base" onClick={() => saveDraft()}>
          임시저장
        </button>
      </div>
    );
  };

  // 2) 날짜선택 컴포넌트
  /** Date 타입의 변수를 넣으면 yyyy-mm-dd로 수정해주는 함수*/
  const replaceDateType = (date) => {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(replaceDateType(new Date()));
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
  const MinContent = 25;
  const MaxContent = 500;

  // 3) 내용입력시 textarea에 반영
  const handleContent = (e) => {
    setIsInterpVisible(false);
    // setContent(e.target.value);
    console.log(e.target.value.length);
    if (e.target.value.length <= MaxContent) {
      setContent(e.target.value);
    }
  };

  // 꿈 해석 화면 표시 여부
  const [isInterpVisible, setIsInterpVisible] = useState(false);

  async function handleInterp() {
    try {
      if (content.length < MinContent) {
        Swal.fire({
          text: `정확한 해석을 위해 꿈 내용을 ${MinContent}자 이상 작성해주세요.`,
          icon: 'warning',
          confirmButtonText: '확인',
        });
        return 0;
      }
      setIsInterpVisible(true);
      const requestData = {
        content: content,
      };
      const response = await axios.post('/api/generate-Interpretation', requestData);
      setInterpretation(response.date.interpretation);
    } catch {
      handleError();
      // setInterpretation(
      //   '뱀은 종종 두려움이나 걱정의 상징으로 여겨집니다. 몸을 감싸는 뱀은 현재 삶에서 느끼는 압박감이나 불안,두려움을 나타낼 수 있습니다. 이는 직장, 인간관계, 건강 등 다양한 영역에서 느끼는 스트레스를 반영할 수있습니다.',
      // );
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
        <svg
          className="mx-3 animate-spin"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10Z"
            fill="#AEAEAE"
          />
          <path
            d="M10 0C11.7376 2.07208e-08 13.4452 0.452769 14.9546 1.31368C16.4639 2.1746 17.7229 3.41395 18.6074 4.90959C19.4919 6.40522 19.9715 8.10553 19.9988 9.84293C20.0261 11.5803 19.6002 13.2949 18.7631 14.8175L16.1341 13.3723C16.7201 12.3064 17.0182 11.1062 16.9991 9.89005C16.98 8.67387 16.6444 7.48366 16.0252 6.43671C15.406 5.38976 14.5248 4.52222 13.4682 3.91958C12.4117 3.31694 11.2163 3 10 3L10 0Z"
            fill="white"
          />
        </svg>
        꿈을 해석하고 있습니다.
      </button>
    );
  };

  // 5) 이미지 생성 컴포넌트
  const [options, setOptions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  /** 이미지를 생성해주는 함수, 필요데이터 : content */
  async function handleImgGenerator() {
    try {
      // 이미지 생성하려고 할때마다 다시 초기화하기!
      setImage(null);
      setIsGenerating(true);
      console.log(image, options, isGenerating, selectedImg);

      const requestData = {
        content: content,
      };
      const response = await axios.post('/api/generate-image', requestData);
      // response : 배열
      setOptions(response.data);
    } catch {
      // handleError();
      setTimeout(
        setOptions([
          '/src/assets/dreamImg/img1.png',
          '/src/assets/dreamImg/img2.jpg',
          '/src/assets/dreamImg/img3.jpg',
          'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_0.png',
        ]),
        4000,
      );
    }
  }

  async function imgRegenerator() {
    try {
      setOptions([]);
      setSelectedImg(null);
      await handleImgGenerator();
    } catch {
      handleError();
      setOptions([
        'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_0.png',
        'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1.png',
        'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_2.png',
        'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_3.png',
      ]);
    }
  }

  const handleSelected = (img) => {
    setSelectedImg(img);
  };

  const handleImage = (i) => {
    setImage(options[i]);
    setIsGenerating(false);
  };

  async function saveDream() {
    handleError();
  }

  return (
    // 이 부분 최소 높이 class 수정 필요!!
    <div className="flex flex-col px-4 py-3 text-white" style={{ minheight: '100vh' }}>
      <UpperBar />
      <DateSelector />
      {/* 꿈내용 입력 - textarea */}
      <div className="relative">
        <textarea
          className={`${classList} h-40 w-full resize-none placeholder:text-slate-300`}
          value={content}
          onChange={(e) => {
            handleContent(e);
          }}
          placeholder="꿈 내용을 입력해주세요."
        ></textarea>
        <p className="absolute bottom-5 right-2 text-slate-500">
          {content.length}/{MaxContent}
        </p>
      </div>
      {/* 꿈 해석공간 */}
      <div>
        {isInterpVisible ? (
          interpretation == null ? (
            <InterpLoadingSpinner />
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
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_1188_2581)">
                <path
                  d="M15 0C18.9737 0.0138341 22.7805 1.59973 25.5888 4.41125L28.75 1.25V8.63625C28.7502 8.81539 28.715 8.9928 28.6465 9.15833C28.5781 9.32386 28.4776 9.47427 28.3509 9.60093C28.2243 9.7276 28.0739 9.82805 27.9083 9.89653C27.7428 9.965 27.5654 10.0002 27.3863 10H20L22.9413 7.05875C21.0997 5.22607 18.6797 4.08853 16.0936 3.8399C13.5074 3.59128 10.915 4.24694 8.75804 5.69522C6.60107 7.14349 5.01291 9.29478 4.26411 11.7826C3.5153 14.2705 3.65218 16.941 4.65142 19.3392C5.65066 21.7374 7.45044 23.7151 9.74419 24.9352C12.0379 26.1554 14.6838 26.5426 17.231 26.0308C19.7781 25.5191 22.0691 24.1401 23.7137 22.1287C25.3582 20.1174 26.2545 17.5981 26.25 15H30C30 17.9667 29.1203 20.8668 27.4721 23.3336C25.8238 25.8003 23.4812 27.7229 20.7403 28.8582C17.9994 29.9935 14.9834 30.2906 12.0737 29.7118C9.16394 29.133 6.49119 27.7044 4.39341 25.6066C2.29562 23.5088 0.867006 20.8361 0.288228 17.9264C-0.290551 15.0166 0.00649929 12.0006 1.14181 9.25975C2.27713 6.51886 4.19972 4.17618 6.66645 2.52796C9.13319 0.879735 12.0333 0 15 0V0Z"
                  fill="black"
                />
              </g>
              <defs>
                <clipPath id="clip0_1188_2581">
                  <rect width="30" height="30" fill="white" />
                </clipPath>
              </defs>
            </svg>
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
        <button className={`${classList} h-40 flex-col items-center justify-center`}>
          <svg
            className="inline-block animate-spin"
            width="100"
            height="101"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5C100 78.1142 77.6142 100.5 50 100.5C22.3858 100.5 0 78.1142 0 50.5C0 22.8858 22.3858 0.5 50 0.5C77.6142 0.5 100 22.8858 100 50.5ZM15 50.5C15 69.83 30.67 85.5 50 85.5C69.33 85.5 85 69.83 85 50.5C85 31.17 69.33 15.5 50 15.5C30.67 15.5 15 31.17 15 50.5Z"
              fill="#AEAEAE"
            />
            <path
              d="M50 0.5C58.6881 0.5 67.2262 2.76384 74.7729 7.06842C82.3197 11.373 88.6145 17.5697 93.0371 25.0479C97.4597 32.5261 99.8574 41.0276 99.9938 49.7146C100.13 58.4016 98.0008 66.9743 93.8153 74.5877L80.6707 67.3614C83.6006 62.032 85.0912 56.0311 84.9957 49.9502C84.9002 43.8693 83.2218 37.9183 80.126 32.6835C77.0302 27.4488 72.6238 23.1111 67.3411 20.0979C62.0583 17.0847 56.0816 15.5 50 15.5L50 0.5Z"
              fill="white"
            />
          </svg>
        </button>
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
                        className="rounded-xl bg-white px-2 py-1 text-black"
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
              <button onClick={() => imgRegenerator()}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_1188_2581)">
                    <path
                      d="M15 0C18.9737 0.0138341 22.7805 1.59973 25.5888 4.41125L28.75 1.25V8.63625C28.7502 8.81539 28.715 8.9928 28.6465 9.15833C28.5781 9.32386 28.4776 9.47427 28.3509 9.60093C28.2243 9.7276 28.0739 9.82805 27.9083 9.89653C27.7428 9.965 27.5654 10.0002 27.3863 10H20L22.9413 7.05875C21.0997 5.22607 18.6797 4.08853 16.0936 3.8399C13.5074 3.59128 10.915 4.24694 8.75804 5.69522C6.60107 7.14349 5.01291 9.29478 4.26411 11.7826C3.5153 14.2705 3.65218 16.941 4.65142 19.3392C5.65066 21.7374 7.45044 23.7151 9.74419 24.9352C12.0379 26.1554 14.6838 26.5426 17.231 26.0308C19.7781 25.5191 22.0691 24.1401 23.7137 22.1287C25.3582 20.1174 26.2545 17.5981 26.25 15H30C30 17.9667 29.1203 20.8668 27.4721 23.3336C25.8238 25.8003 23.4812 27.7229 20.7403 28.8582C17.9994 29.9935 14.9834 30.2906 12.0737 29.7118C9.16394 29.133 6.49119 27.7044 4.39341 25.6066C2.29562 23.5088 0.867006 20.8361 0.288228 17.9264C-0.290551 15.0166 0.00649929 12.0006 1.14181 9.25975C2.27713 6.51886 4.19972 4.17618 6.66645 2.52796C9.13319 0.879735 12.0333 0 15 0V0Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1188_2581">
                      <rect width="30" height="30" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
        )
      )}
      <div className="flex justify-center">
        <button onClick={() => saveDream()} className="my-5 h-10 w-32 rounded-full bg-primary-700 font-bold">
          저장하기
        </button>
      </div>
    </div>
  );
};

export default DreamRegisterPage;
