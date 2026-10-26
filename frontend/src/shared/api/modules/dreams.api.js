import api from '../http-client';
// TODO: 임시저장 제거하기
const dreamsApi = {
  // writeTime: YYYYMMDD (예: 20261001). 날짜 가공은 호출부에서 수행한다.
  getMonthlyDreams: (userId, writeTime, config) => api.get(`/dream/${userId}/${writeTime}`, config),
  createDream: (data, config) => api.post('/dream/create', data, config),
  getDream: (dreamId, config) => api.get(`/dream/${dreamId}`, config),
  updateDream: (dreamId, data, config) => api.put(`/dream/${dreamId}`, data, config),
  deleteDream: (dreamId, config) => api.delete(`/dream/${dreamId}`, config),
  saveDraft: (data, config) => api.post('/dream/temporary', data, config),
};

export default dreamsApi;
