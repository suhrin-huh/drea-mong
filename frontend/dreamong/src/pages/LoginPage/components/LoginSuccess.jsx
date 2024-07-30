import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post('https://localhost:8080/auth/refresh', {}, { withCredentials: true })
      .then((response) => {
        const accessToken = response.headers['authorization'].split(' ')[1];
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

export default LoginSuccess;
