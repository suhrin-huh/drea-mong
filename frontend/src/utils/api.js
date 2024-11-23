// api.js
import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    // 토큰이 변경될 수 있으므로 요청 전에 항상 최신 토큰을 가져옵니다.
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 예를 들어, 401 Unauthorized 오류가 발생했을 때
    if (error.response && error.response.status === 401) {
      // 로그인 페이지로 리다이렉트할 수 있습니다.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
