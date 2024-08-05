import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { userState } from '../../../recoil/atoms';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    axios
      .post('https://i11c106.p.ssafy.io/auth/refresh', {}, { withCredentials: true })
      .then((response) => {
        const accessToken = response.headers['authorization'].split(' ')[1];
        localStorage.setItem('accessToken', accessToken);
        alert('Access token stored in local storage');
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
        alert('Failed to refresh access token');
      })
      .then((response) => {
        axios({
          method: 'get',
          url: '/api/user/me',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }).then((res) => {
          setUser(res.data);
        });
      });
  }, [navigate]);

  return <div>카카오 로그인 처리 중...</div>;
};

export default LoginSuccess;
