import api from '../http-client';

const commentsApi = {
  createComment: (data, config) => api.post('/comments/create', data, config),
  toggleLike: (userId, commentId, config) => api.post(`/comments/${userId}/${commentId}/like`, {}, config),
  deleteComment: (commentId, config) => api.delete(`/comments/${commentId}`, config),
};

export default commentsApi;
