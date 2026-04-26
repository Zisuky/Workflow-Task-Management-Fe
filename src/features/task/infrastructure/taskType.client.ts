import api from '../../../shared/http/apiClient';

export interface TaskType { id: string; name: string; }

export const taskTypeApi = {
  getAll() { return api.get('/task-types'); },
  getById(id: string) { return api.get(`/task-types/${id}`); },
};
