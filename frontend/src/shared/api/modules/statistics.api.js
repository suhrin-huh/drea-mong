import api from '../http-client';

const statisticsApi = {
  // currentDate: YYYYMM (예: 202610).
  getMonthlyStatistics: (userId, currentDate, config) => api.get(`/statistics/${userId}/${currentDate}`, config),
};

export default statisticsApi;
