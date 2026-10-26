import api from '../http-client';

const roomsApi = {
  getRooms: (config) => api.get('/rooms', config),
  getRoom: (roomId, config) => api.get(`/rooms/${roomId}`, config),
  createRoom: (data, config) => api.post('/rooms', data, config),
  deleteRoom: (roomId, config) => api.delete(`/rooms/${roomId}`, config),
};

export default roomsApi;
