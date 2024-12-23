// React 관련 패키지
import { useNavigate } from 'react-router-dom';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilValue, useRecoilCallback } from 'recoil';
import { baseURLState } from '../../../recoil/atoms';
import { dateState, contentState, interpState, imageState, isSharedState } from '../../../recoil/dream/atom';

// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import axios from 'axios';

// 앱 내부의 컴포넌트/아이콘
import { useHandleError } from '../../../utils/utils';

const UpperBar = ({ mode }) => {
  const baseURL = useRecoilValue(baseURLState);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const handleError = useHandleError();

  const navigateBack = () => {
    Swal.fire({
      icon: 'warning',
      text: '변경사항이 저장되지 않습니다. 페이지를 이동하시겠습니까?',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(-1);
      }
    });
  };
  /** 임시저장 : 공백만 입력, 내용 미입력시에는 모달 표시 */
  const saveDraft = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const content = await snapshot.getPromise(contentState);
        const image = await snapshot.getPromise(imageState);
        const interpretation = await snapshot.getPromise(interpState);
        const userId = (await snapshot.getPromise(userState)?.userId) || null;
        const isShared = await snapshot.getPromise(isSharedState);
        const writeTime = await snapshot.getPromise(dateState);

        if (content.replace(/ /g, '') == '') {
          Swal.fire({
            title: 'ERROR',
            icon: 'error',
            text: '공백은 저장이 불가능합니다.',
          });
          return;
        }

        const result = await Swal.fire({
          title: '임시저장하시겠습니까?',
          text: '임시저장된 일기는 통계에 포함되지 않습니다.',
          icon: 'warning',
          confirmButtonText: '확인',
          showCancelButton: true,
        });

        if (result.isConfirmed) {
          try {
            const requestData = {
              content: content,
              image: image,
              isShared: isShared,
              interpretation: interpretation,
              userId: userId,
              writeTime: writeTime.replace(/-/g, ''),
            };
            const res = await axios.post(`${baseURL}/dream/temporary`, requestData, {
              headers: { Authorization: `Bearer ${accessToken}` },
              withCredentials: true,
            });
            console.log(res);
            navigate('/');
          } catch (error) {
            if (error.response && error.response.status === 401) {
              // navigate('/login');
            } else {
              // navigate('/error');
            }
          }
        }
      },
    [],
  );

  const deleteDream = async () => {
    try {
      const { value: confirmed } = await Swal.fire({
        title: '일기를 삭제하시겠습니까?',
        icon: 'warning',
        confirmButtonText: '확인',
        showCancelButton: true,
        denyButtonText: '취소',
      });
      if (confirmed) {
        const response = await axios.delete(`${baseURL}/dream/${dreamId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        console.log(response);
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // navigate('/login');
      } else {
        // navigate('/error');
      }
    }
  };

  return (
    <div className="flex h-7 items-center justify-between">
      <button onClick={() => navigateBack()}>
        <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 13L1.5 7L7.5 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {mode == 'save' && (
        <button className="text-base" onClick={() => saveDraft()}>
          임시저장
        </button>
      )}
      {mode == 'delete' && (
        <button className="text-base" onClick={() => deleteDream()}>
          삭제
        </button>
      )}
    </div>
  );
};

export default UpperBar;
