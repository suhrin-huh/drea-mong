// TODO: REST API 형태 지키기
import api from '../http-client';

const generationApi = {
  generateImages: (data, config) => api.post('/api/generate-image', data, config),
  generateInterpretation: (data, config) => api.post('/api/generate-interpretation', data, config),
};

export default generationApi;
