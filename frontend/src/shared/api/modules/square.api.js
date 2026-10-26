import api from '../http-client';

const squareApi = {
  // params: { cursorId?, size? }. size의 서버 기본값은 10이다.
  getDreams: (params, config) => api.get('/square/dreams', { ...config, params }),
  getDream: (dreamId, userId, config) => api.get(`/square/${dreamId}`, { ...config, params: { userId } }),
};

export default squareApi;
