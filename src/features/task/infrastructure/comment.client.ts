import api from '../../../shared/http/apiClient';

export interface Comment {
  id: string;
  userId: string;
  comment: string;
  createdAt: string;
}

export const commentApi = {
  getByTaskId(taskId: string) {
    return api.get(`/tasks/${taskId}/comments`);
  },
  create(taskId: string, comment: string) {
    return api.post(`/tasks/${taskId}/comments`, { comment });
  },
};
