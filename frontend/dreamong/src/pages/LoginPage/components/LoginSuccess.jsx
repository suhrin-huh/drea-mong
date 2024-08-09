import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState, baseURLState } from '../../../recoil/atoms';
import { getFCMToken } from '../../../utils/firebase';

import 'ldrs/squircle';

const LoginSuccess = () => {
  const navigate = useNavigate();

  const [isTokenFound, setTokenFound] = useState(false);

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
      .then((response) => {
        getFCMToken(setTokenFound); // FCM 토큰 가져오기 및 서버로 전송
      })
      .catch((error) => {
        console.error('Error in authentication flow:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        alert('로그인 과정 중 에러가 발생했습니다. 다시 시도해 주시기 바랍니다.');
        navigate('/login');
      });
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <l-tailspin size="50" stroke="6" speed="0.8" color="black"></l-tailspin>
    </div>
  );
};

export default LoginSuccess;
