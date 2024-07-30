import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KakaoLoginCallback = () => {
  const navigate = useNavigate();
  console.log('test1');

  useEffect(() => {
    // const code = new URL(window.location.href).searchParams.get('code');
    console.log('test2');
    axios({
      method: 'post',
      url: 'https://192.168.100.108:8080/auth/refresh',
      headers: {
        'Content-Type': `application/json`,
        'ngrok-skip-browser-warning': '69420',
      },
      withCredentials: true,
    })
      .then((res) => {
        console.log('11111111111');
        const accessToken = res.headers['authorization'].split(' ')[1];
        console.log('test3');
        localStorage.setItem('accessToken', accessToken);
        alert('Access token stored in local storage');
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
        alert('Failed to refresh access token');
      });
  }, [navigate]);

  return <div>카카오 로그인 처리 중...</div>;
};

export default KakaoLoginCallback;
