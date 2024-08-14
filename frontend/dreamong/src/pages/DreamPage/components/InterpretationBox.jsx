// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { baseURLState } from '../../../recoil/atoms';

// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import axios from 'axios';

// 앱 내부의 컴포넌트/아이콘
import Button from '../../../components/Button';
import { useHandleError } from '../../../utils/utils';
import { SmallLoadingSpinner, ArrowIcon } from '../../../assets/icons';

/** - 해석 생성
 * - 오류 발생시 현재 페이지에 머무른다.*/
const InterpretationBox = ({
  MIN_LENGTH,
  classList,
  content,
  interpretation,
  setInterpretation,
  isInterpVisible,
  setIsInterpVisible,
}) => {
  const baseURL = useRecoilValue(baseURLState);
  const handleError = useHandleError();
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  /** 해석 생성 함수 해석*/
  const handleInterp = async () => {
    try {
      if (!accessToken) return Navigate('/login');
      // 1) 공백 및 최소 글자수 미만으로 작성 시 생성
      if (content.replace(/ /g, '') == '') {
        Swal.fire({
          title: 'ERROR',
          icon: 'error',
          text: '공백은 해석이 불가능합니다.',
        });
        return;
      }
      if (content.length < MIN_LENGTH) {
        Swal.fire({
          text: `정확한 해석을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
          icon: 'warning',
          confirmButtonText: '확인',
        });
        return;
      }
      // 2) 해석이 이미 존재한다면 새로 작성하기 위해 해석 초기화
      if (interpretation) {
        setInterpretation(null);
      }

      // 3) 해석이 보일 수 있도록 설정
      setIsInterpVisible(true);

      // 4) API 통신 후 생성된 해석 할당
      const requestData = {
        message: content,
      };

      const response = await axios.post(`${baseURL}/api/generate-interpretation`, requestData, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
        withCredentials: true,
      });

      setInterpretation(response.data.data);
    } catch (error) {
      // 오류 발생 시에는 해석생성 버튼으로 돌아오기
      setIsInterpVisible(false);
      console.log(error.message);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        Swal.fire({
          icon: 'error',
          text: '오류가 발생했습니다. 해석을 다시 생성해주세요.',
        });
      }
    }
  };

  const closeInterp = () => {
    setIsInterpVisible(false);
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
      {!isInterpVisible ? (
        <Button
          children="꿈 해석 보기"
          onClick={() => (interpretation ? setIsInterpVisible(true) : handleInterp())}
          variant={'primary'}
          fullWidth={true}
        ></Button>
      ) : // 해석이 존재할 때 해석 보기 클릭 시 해석 내용 조회
      interpretation ? (
        <div className={`${classList} relative flex-col justify-center`}>
          <div>
            <p className="pb-3 text-center text-xl font-bold">꿈 해석</p>
            {interpretation && <p className="break-all">{interpretation}</p>}
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
