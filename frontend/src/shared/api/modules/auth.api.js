import api from '../http-client';

const authApi = {
  refreshSession: (config) => api.post('/auth/refresh', {}, config),
};

export default authApi;
