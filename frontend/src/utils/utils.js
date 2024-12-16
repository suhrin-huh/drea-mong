// React 관련 패키지
import { useNavigate } from 'react-router-dom';

// 앱 내부의 상태 관리와 관련된 파일

// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

/** - 오류 발생 모달 표시 후 돌아가기 클릭시 redirectURL로 이동
 * - 경로 없으면 현재 페이지
 * - { redirectURL = '' } = {} : 인자 미제공시에 발생하는 오류 해결
 * - Invalid hook call : 훅은 React의 함수형 컴포넌트 내에서만 사용*/
export function useHandleError({ redirectURL = '' } = {}) {
  const navigate = useNavigate(); // 함수형 컴포넌트(return) 내에서만 작성 가능

  return (redirectURL = '') => {
    Swal.fire({
      title: 'ERROR',
      text: '오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '돌아가기',
    }).then((result) => {
      if (result.isConfirmed && redirectURL) {
        navigate(redirectURL);
      }
    });
  };
}
