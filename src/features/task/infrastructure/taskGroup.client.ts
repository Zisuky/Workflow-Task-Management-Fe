import api from '../../../shared/http/apiClient';

export interface TaskGroup { id: string; name: string; }

export const taskGroupApi = {
  getAll() { return api.get('/task-groups'); },
  getById(id: string) { return api.get(`/task-groups/${id}`); },
};
