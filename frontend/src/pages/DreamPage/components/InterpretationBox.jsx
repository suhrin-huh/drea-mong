// 앱 내부의 상태 관리와 관련된 파일
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import api from '../../../utils/api';

// 앱 내부의 컴포넌트/아이콘
import Button from '../../../components/Button';
import { useHandleError } from '../../../utils/utils';
import { SmallLoadingSpinner, ArrowIcon } from '../../../assets/icons';
import { useRecoilState, useRecoilCallback } from 'recoil';
import { contentState, interpState } from '../../../recoil/dream/atom';
import { contentValidation } from '../../../recoil/dream/selector';

const InterpretationBox = ({ MIN_LENGTH, classList, initial }) => {
  const [interp, setInterp] = useRecoilState(interpState);

  const handleError = useHandleError();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setInterp(initial);
  });

  /** 해석 생성 함수 해석*/
  const handleInterp = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const content = await snapshot.getPromise(contentState);
        const isValid = await snapshot.getPromise(contentValidation);
        try {
          if (isValid == 'blank') {
            Swal.fire({
              title: 'ERROR',
              icon: 'error',
              text: '공백은 해석이 불가능합니다.',
            });
            return;
          }
          if (isValid == 'short') {
            Swal.fire({
              text: `정확한 해석을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
              icon: 'warning',
              confirmButtonText: '확인',
            });
            return;
          }
          // 2) 해석이 이미 존재한다면 새로 작성하기 위해 해석 초기화
          if (interp) {
            setInterp(null);
          }

          // 3) 해석이 보일 수 있도록 설정
          setIsVisible(true);

          // 4) API 통신 후 생성된 해석 할당
          const requestData = {
            message: content,
          };

          const response = await api.post(`/api/generate-interpretation`, requestData);

          setInterp(response.data.data);
        } catch (error) {
          setIsVisible(true);
          if (error.response && error.response.status === 401) {
            navigate('/login');
          } else {
            handleError();
          }
        }
      },
    [],
  );

  const closeInterp = () => {
    setIsVisible(false);
  };

  const InterpLoadingBox = () => {
    return (
      <button className="flex w-full items-center justify-center rounded-lg bg-primary-500 py-3">
        {SmallLoadingSpinner}
        꿈을 해석하고 있습니다.
      </button>
    );
  };

  return (
    <div>
      {/* 해석을 보고있지 않을 때에는 버튼*/}
      {!isVisible ? (
        <Button
          children="꿈 해석 보기"
          onClick={() => (interp ? setIsInterpVisible(true) : handleInterp())}
          variant={'primary'}
          fullWidth={true}
        ></Button>
      ) : // 해석이 존재할 때 해석 보기 클릭 시 해석 내용 조회
      interp ? (
        <div className={`${classList} relative flex-col justify-center`}>
          <div>
            <p className="pb-3 text-center text-xl font-bold">꿈 해석</p>
            {interp && <p className="break-all">{interp}</p>}
            <button
              className="mx-auto my-3 block rounded-full border border-white px-3 py-1"
              onClick={() => handleInterp()}
            >
              해석 재생성하기
            </button>
            <button
              className="absolute right-3 top-2 text-center text-2xl text-slate-100"
              onClick={() => closeInterp()}
            >
              <div className={`transition-transform duration-1000 ease-in-out`}>{ArrowIcon}</div>
            </button>
          </div>
        </div>
      ) : (
        // 해석 생성중일 때에는 로딩바
        <InterpLoadingBox />
      )}
    </div>
  );
};

export default InterpretationBox;
