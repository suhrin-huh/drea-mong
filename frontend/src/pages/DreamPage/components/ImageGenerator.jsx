// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import api from '../../../utils/api';

// 앱 내부의 컴포넌트/아이콘
import { useHandleError } from '../../../utils/utils';
import { LargeRegeneratorIcon } from '../../../assets/icons';
import imgGenerator from '../../../assets/img_generator.png';
import censoredImage from '../../../assets/censoredImg.png';

// React 관련 패키지
import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { contentState, imageState } from '../../../recoil/dream/atom';
import { contentValidation } from '../../../recoil/dream/selector';

const ImageGenerator = ({ MIN_LENGTH, classList, initial }) => {
  const handleError = useHandleError();
  const [image, setImage] = useState(imageState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setImage(initial);
  }, []);

  const handleImgGenerator = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        try {
          const content = snapshot.getPromise(contentState);
          const isValid = snapshot.getPromise(contentValidation);
          if (isValid == 'short') {
            Swal.fire({
              text: `정확한 이미지 생성을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
              icon: 'warning',
              confirmButtonText: '확인',
            });
            return 0;
          }
          setIsGenerating(true);
          // content를 사용해 이미지 생성

          const requestData = {
            prompt: content,
          };
          const response = await api.post(`/api/generate-image`, requestData);

          const censoredOptions = response.data.data;
          while (censoredOptions.length < 4) {
            censoredOptions.push('');
          }
          setOptions(censoredOptions);
        } catch (err) {
          console.log(err);
          setImage(null);
          setIsGenerating(false);
          setOptions(null);
          Swal.fire({
            icon: 'error',
            text: '오류가 발생했습니다. 다시 시도해주세요.',
          });
        }
      },
    [],
  );

  // 이미지 재생성 버튼, 기존의 이미지와 선택지들 초기화한 후에 생성
  const imgRegenerator = async () => {
    try {
      setImage(null);
      setOptions(null);
      setSelected(null);
      await handleImgGenerator();
    } catch {
      handleError();
    }
  };

  const handleSelected = (i) => {
    if (options[i] == '') {
      Swal.fire({
        icon: 'warning',
        text: '검열된 이미지는 선택할 수 없습니다.',
        confirmButtonText: '확인',
      });
      return;
    }
    setSelected(i);
  };

  const handleImage = (i) => {
    setImage(options[i]);
    setIsGenerating(false);
    setOptions(null);
    setSelected(null);
  };

  if (image) {
    return (
      <div className={`${classList} relative rounded-lg`}>
        <button onClick={() => imgRegenerator()} className="z-1 absolute right-6 top-6">
          {LargeRegeneratorIcon}
        </button>
        <img src={image}></img>
      </div>
    );
  }

  if (options) {
    return (
      <div className={`${classList}`}>
        <p className="my-3 text-center text-lg">그림을 선택하세요</p>
        <div className="grid grid-cols-2">
          {options.map((img, idx) => (
            <div
              key={idx}
              className={`relative block h-full p-1 ${selected == idx ? 'rounded-lg border border-slate-100' : null}`}
            >
              {/* 이미지가 존재하면 표시, 검열된 이미지면 다른 이미지 렌더링 */}
              <img
                onClick={() => handleSelected(idx)}
                className={`block h-full w-full rounded-lg`}
                src={img ? img : censoredImage}
                key={idx}
              ></img>
              {selected == idx ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 text-white">
                  <button
                    className="rounded-full bg-primary-500 px-3 py-1 text-white"
                    onClick={() => {
                      handleImage(idx);
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
    );
  }

  // 생성중에는 로딩스피너
  if (isGenerating) {
    // return <button className={`${classList} h-40 flex-col items-center justify-center`}>{LargeLoadingSpinner}</button>;
    return (
      <div className={`${classList} flex-row`}>
        <button className={`flex h-40 w-full items-center justify-center`}>
          <div class="loader"></div>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => handleImgGenerator()}
      className="my-2 w-full flex-row items-center justify-center rounded-lg bg-primary-500 p-4"
    >
      <img className="inline-block h-20 w-20" src={imgGenerator} alt="이미지 생성하기" />

      <p className="py-2 font-bold">꿈 이미지 생성하기</p>
    </button>
  );
};

export default ImageGenerator;
