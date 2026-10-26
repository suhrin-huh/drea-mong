import axios from 'axios';
import { isMockMode } from '../config/api-mode';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  ...(isMockMode
    ? {
        adapter: async (config) => {
          const { default: mockAdapter } = await import('./mocks/mock-adapter');
          return mockAdapter(config);
        },
      }
    : {}),
  headers: { 'Content-Type': 'application/json' },
});

// 앱 백엔드 전용 client. 외부 서비스에는 별도 client를 사용한다.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !isMockMode) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// AxiosResponse/AxiosError를 보존해 호출부가 status, headers, body를 처리한다.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
