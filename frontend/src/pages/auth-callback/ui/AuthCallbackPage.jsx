import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '@/shared/api/modules/auth.api';
import usersApi from '@/shared/api/modules/users.api';
import { useSetRecoilState } from 'recoil';
import 'ldrs/squircle';
import { userState } from '@/entities/user';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const setUserState = useSetRecoilState(userState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await authApi.refreshSession();

        const accessToken = response.headers['authorization']?.split(' ')[1];
        if (!accessToken) {
          throw new Error('No access token in response');
        }
        localStorage.setItem('accessToken', accessToken);

        const res = await usersApi.getUserInfo();

        setUserState(res.data.data);
        navigate('/');
      } catch (error) {
        console.error('Error in authentication flow:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        alert('로그인 과정 중 에러가 발생했습니다. 다시 시도해 주시기 바랍니다.');
        navigate('/login');
      }
    };
    initialize();
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <l-tailspin size="50" stroke="6" speed="0.8" color="black"></l-tailspin>
    </div>
  );
};

export default AuthCallbackPage;
