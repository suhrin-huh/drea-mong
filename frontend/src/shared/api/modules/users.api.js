import api from '../http-client';

const usersApi = {
  getUserInfo: (config) => api.get('/users/info', config),
  logout: (config) => api.post('/users/logout', {}, config),
  updateNickname: (data, config) => api.patch('/users/nickname', data, config),
};

export default usersApi;
