import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import dreamsApi from '@/shared/api/modules/dreams.api';
import { userState } from '@/entities/user';
import { useHandleError } from '@/shared/lib/error';
import 'sweetalert2/src/sweetalert2.scss';

/** - mode에 따라 임시저장(create) / 삭제(detail)
 * - 현재 오류 경로 : login*/
const DreamEditorHeader = ({ content = '', image = '', interpretation = '', date = '', dreamId = '', mode }) => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const handleError = useHandleError();

  const navigateBack = async () => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        text: '변경사항이 저장되지 않습니다. 페이지를 이동하시겠습니까?',
      });

      if (result.isConfirmed) {
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
    }
  };
  /** 임시저장 : 공백만 입력, 내용 미입력시에는 모달 표시 */
  const saveDraft = async () => {
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
      showCancelButton: true, // 취소 버튼을 추가하여 사용자가 선택할 수 있게 함
    });

    if (result.isConfirmed) {
      if (content.length !== 0) {
        try {
          const requestData = {
            content: content,
            image: image,
            interpretation: interpretation,
            userId: user.userId,
            writeTime: date.replace(/-/g, ''),
          };
          await dreamsApi.saveDraft(requestData);
          navigate('/');
        } catch (error) {
          if (error.response && error.response.status === 401) {
            navigate('/login');
          } else {
            navigate('/error');
          }
        }
      }
    }
  };

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
        const response = await dreamsApi.deleteDream(dreamId);
        console.log(response);
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        navigate('/error');
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

export default DreamEditorHeader;
