import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

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
