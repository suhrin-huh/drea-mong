import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState, baseURLState } from '../../../recoil/atoms';

import 'ldrs/squircle';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const setUserState = useSetRecoilState(userState);
  const baseURL = useRecoilValue(baseURLState);

  useEffect(() => {
    axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        const accessToken = response.headers['authorization']?.split(' ')[1];
        if (!accessToken) {
          throw new Error('No access token in response');
        }
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      })
      .then((accessToken) => {
        return axios({
          method: 'get',
          url: `${baseURL}/users/info`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((res) => {
        setUserState(res.data.data);
        navigate('/');
      })
      .catch((error) => {
        console.error('Error in authentication flow:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        alert('Authentication failed. Please try logging in again.');
        // 로그인 페이지로 리다이렉트 또는 다른 에러 처리 로직
      });
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <l-tailspin size="50" stroke="6" speed="0.8" color="black"></l-tailspin>
    </div>
  );
};

export default LoginSuccess;
